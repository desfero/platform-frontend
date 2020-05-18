import { call, fork, put, SagaGenerator, select } from "@neufund/sagas";
import {
  authModuleAPI,
  EWalletType,
  IVerifyEmailUser,
  neuGetBindings,
} from "@neufund/shared-modules";
import { includes } from "lodash/fp";

import {
  EUnverifiedEmailReminderModalType,
  UnverifiedEmailReminderModal,
} from "../../../components/modals/unverified-email-reminder/UnverifiedEmailReminderModal";
import { AuthMessage } from "../../../components/translatedMessages/messages";
import { createNotificationMessage } from "../../../components/translatedMessages/utils";
import { USERS_WITH_ACCOUNT_SETUP } from "../../../config/constants";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { TStoredWalletMetadata } from "../../../lib/persistence/WalletStorage";
import { TAppGlobalState } from "../../../store";
import { actions } from "../../actions";
import { userHasKycAndEmailVerified } from "../../eto-flow/selectors";
import { webNotificationUIModuleApi } from "../../notification-ui/module";
import { selectIsVerifyEmailRedirect } from "../../routing/selectors";
import { neuCall, neuTakeEvery } from "../../sagasUtils";
import { selectActivationCodeFromQueryString, selectWalletType } from "../../web3/selectors";
import {
  selectIsAgreementAccepted,
  selectUnverifiedUserEmail,
  selectUserType,
  selectVerifiedUserEmail,
} from "../selectors";
import { loadUser } from "../user/external/sagas";

/**
 * Email Verification
 */
export function* processVerifyEmailLink({
  walletStorage,
}: TGlobalDependencies): Generator<any, any, any> {
  const walletMetadata = (yield* call(() => walletStorage.get()))!;
  const unverifiedEmail = yield* select(selectUnverifiedUserEmail);
  // we ignore everything in the activation link except the code. e-mails may be spoofed or mangled by mail clients
  const userCode = (yield* select(selectActivationCodeFromQueryString))!;

  function* goHome(): Generator<any, any, any> {
    const userType = yield* select((s: TAppGlobalState) => selectUserType(s));
    const kycAndEmailVerified = yield* select((s: TAppGlobalState) =>
      userHasKycAndEmailVerified(s),
    );

    if (!kycAndEmailVerified && includes(userType, USERS_WITH_ACCOUNT_SETUP)) {
      yield put(actions.routing.goToDashboard());
    } else {
      yield put(actions.routing.goToProfile());
    }
  }

  if (walletMetadata.walletType === EWalletType.LIGHT) {
    // in case of light wallet email activation link will be also used to login so dealing with invalid activation
    // codes is normal
    if (unverifiedEmail === undefined) {
      // if there's nothing to activate - exit
      yield* goHome();
      return;
    }
  } else {
    // in case of other wallets say e-mail is already activated
    if (unverifiedEmail === undefined) {
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(AuthMessage.AUTH_EMAIL_ALREADY_VERIFIED),
        ),
      );
      yield* goHome();
      return;
    }
  }

  const activated: boolean = yield neuCall(verifyUserEmailPromise, userCode);
  if (!activated) {
    // there was a problem when activating - go to profile for full overview
    yield put(actions.routing.goToProfile());
    return;
  }
  yield neuCall(loadUser);
  // Update metadata email only when wallet type is LightWallet
  if (walletMetadata.walletType === EWalletType.LIGHT) {
    const verifiedEmail = yield* select(selectVerifiedUserEmail);
    const updatedMetadata: TStoredWalletMetadata = { ...walletMetadata, email: verifiedEmail! };
    yield* call(() => walletStorage.set(updatedMetadata));
  }
  yield* goHome();
}

export function* verifyUserEmailPromise(
  _: TGlobalDependencies,
  userCode: IVerifyEmailUser,
): SagaGenerator<boolean> {
  const { apiUserService } = yield* neuGetBindings({
    apiUserService: authModuleAPI.symbols.apiUserService,
  });

  try {
    yield* call(apiUserService.verifyUserEmail, userCode);
    yield put(
      webNotificationUIModuleApi.actions.showInfo(
        createNotificationMessage(AuthMessage.AUTH_EMAIL_VERIFIED),
      ),
    );
  } catch (e) {
    const getNotificationAction = (message: AuthMessage) =>
      webNotificationUIModuleApi.actions.showError(createNotificationMessage(message), {
        "data-test-id": `modules.auth.sagas.verify-user-email.toast.verification-failed-${message}`,
      });

    if (e instanceof authModuleAPI.error.EmailAlreadyExists) {
      yield put(getNotificationAction(AuthMessage.AUTH_EMAIL_ALREADY_EXISTS));
    } else if (e instanceof authModuleAPI.error.EmailActivationCodeMismatch) {
      yield put(getNotificationAction(AuthMessage.AUTH_EMAIL_VERIFICATION_CODE_MISMATCH));
    } else {
      yield put(getNotificationAction(AuthMessage.AUTH_EMAIL_VERIFICATION_FAILED));
    }

    return false;
  }

  return true;
}

export function* isEmailAvailablePromise(
  _: TGlobalDependencies,
  email: string,
): SagaGenerator<boolean> {
  const { apiUserService } = yield* neuGetBindings({
    apiUserService: authModuleAPI.symbols.apiUserService,
  });

  const emailStatus = yield* call(() => apiUserService.emailStatus(email));

  return emailStatus.isAvailable;
}

export function* checkForPendingEmailVerification(): Generator<any, void, any> {
  const tosAccepted = yield* select(selectIsAgreementAccepted);
  const unverifiedEmail = yield* select(selectUnverifiedUserEmail);

  // this is a workaround for #3942 (see QA's comment).
  // this can be done in a much nicer way after implementing route-based saga approach
  // TODO refactor after we move to route-based sagas
  const verifyEmailRedirect = yield select(selectIsVerifyEmailRedirect);

  if (!verifyEmailRedirect && unverifiedEmail !== undefined && tosAccepted) {
    const walletType = yield* select(selectWalletType);
    yield put(
      actions.genericModal.showModal(UnverifiedEmailReminderModal, {
        unverifiedEmail,
        modalType:
          walletType === EWalletType.LIGHT
            ? EUnverifiedEmailReminderModalType.LIGHT_WALLET_UNVERIFIED_EMAIL_REMINDER_MODAL
            : EUnverifiedEmailReminderModalType.BROWSER_LEDGER_UNVERIFIED_EMAIL_REMINDER_MODAL,
      }),
    );
  }
}

export function* authEmailSagas(): Generator<any, any, any> {
  yield fork(neuTakeEvery, actions.auth.verifyEmailLink, processVerifyEmailLink);
}
