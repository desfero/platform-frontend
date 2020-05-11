import { call, fork, put, select } from "@neufund/sagas";
import { includes } from "lodash/fp";

import {
  EUnverifiedEmailReminderModalType,
  UnverifiedEmailReminderModal,
} from "../../../components/modals/unverified-email-reminder/UnverifiedEmailReminderModal";
import { AuthMessage } from "../../../components/translatedMessages/messages";
import { createMessage } from "../../../components/translatedMessages/utils";
import { USERS_WITH_ACCOUNT_SETUP } from "../../../config/constants";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { IVerifyEmailUser } from "../../../lib/api/users/interfaces";
import { EmailActivationCodeMismatch, EmailAlreadyExists } from "../../../lib/api/users/UsersApi";
import { TStoredWalletMetadata } from "../../../lib/persistence/WalletStorage";
import { TAppGlobalState } from "../../../store";
import { actions } from "../../actions";
import { userHasKycAndEmailVerified } from "../../eto-flow/selectors";
import { selectIsVerifyEmailRedirect } from "../../routing/selectors";
import { neuCall, neuTakeEvery } from "../../sagasUtils";
import { selectActivationCodeFromQueryString, selectWalletType } from "../../web3/selectors";
import { EWalletType } from "../../web3/types";
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
  notificationCenter,
}: TGlobalDependencies): Generator<any, any, any> {
  const walletMetadata = (yield* call(() => walletStorage.get()))!;
  const unverifiedEmail = yield* select((s: TAppGlobalState) => selectUnverifiedUserEmail(s.auth));
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
      yield notificationCenter.error(createMessage(AuthMessage.AUTH_EMAIL_ALREADY_VERIFIED));
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
    const verifiedEmail = yield* select((s: TAppGlobalState) => selectVerifiedUserEmail(s.auth));
    const updatedMetadata: TStoredWalletMetadata = { ...walletMetadata, email: verifiedEmail! };
    yield* call(() => walletStorage.set(updatedMetadata));
  }
  yield* goHome();
}

async function verifyUserEmailPromise(
  { apiUserService, notificationCenter }: TGlobalDependencies,
  userCode: IVerifyEmailUser,
): Promise<boolean> {
  try {
    await apiUserService.verifyUserEmail(userCode);
    await notificationCenter.info(createMessage(AuthMessage.AUTH_EMAIL_VERIFIED));
  } catch (e) {
    const toast = (message: AuthMessage) =>
      notificationCenter.error(createMessage(message), {
        "data-test-id": `modules.auth.sagas.verify-user-email.toast.verification-failed-${message}`,
      });

    if (e instanceof EmailAlreadyExists) {
      await toast(AuthMessage.AUTH_EMAIL_ALREADY_EXISTS);
    } else if (e instanceof EmailActivationCodeMismatch) {
      await toast(AuthMessage.AUTH_EMAIL_VERIFICATION_CODE_MISMATCH);
    } else {
      await toast(AuthMessage.AUTH_EMAIL_VERIFICATION_FAILED);
    }
    return false;
  }

  return true;
}

export async function isEmailAvailablePromise(
  { apiUserService }: TGlobalDependencies,
  email: string,
): Promise<boolean> {
  const emailStatus = await apiUserService.emailStatus(email);
  return emailStatus.isAvailable;
}

export function* checkForPendingEmailVerification(): Generator<any, void, any> {
  const tosAccepted = yield* select(selectIsAgreementAccepted);
  const unverifiedEmail = yield* select((s: TAppGlobalState) => selectUnverifiedUserEmail(s.auth));

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
