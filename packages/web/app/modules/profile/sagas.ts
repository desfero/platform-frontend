import { call, fork, put, select } from "@neufund/sagas";
import { authModuleAPI, EJwtPermissions } from "@neufund/shared-modules";

import { ProfileMessage } from "../../components/translatedMessages/messages";
import {
  createMessage,
  createNotificationMessage,
} from "../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../di/setupBindings";
import { TAppGlobalState } from "../../store";
import { accessWalletAndRunEffect } from "../access-wallet/sagas";
import { actions, TActionFromCreator } from "../actions";
import { MessageSignCancelledError } from "../auth/errors";
import { ensurePermissionsArePresentAndRunEffect } from "../auth/jwt/sagas";
import {
  selectDoesEmailExist,
  selectUnverifiedUserEmail,
  selectUser,
  selectVerifiedUserEmail,
} from "../auth/selectors";
import { updateUser } from "../auth/user/external/sagas";
import { webNotificationUIModuleApi } from "../notification-ui/module";
import { neuCall, neuTakeEvery } from "../sagasUtils";
import { selectLightWalletSalt } from "../web3/selectors";

function* addNewEmailEffect({ logger }: TGlobalDependencies, email: string): any {
  const user = yield select((s: TAppGlobalState) => selectUser(s));
  const salt = yield select(selectLightWalletSalt);
  logger.info("New Email added");
  yield neuCall(updateUser, { ...user, new_email: email, salt: salt });
  yield put(
    webNotificationUIModuleApi.actions.showInfo(
      createNotificationMessage(ProfileMessage.PROFILE_NEW_EMAIL_ADDED),
      {
        "data-test-id": "profile-email-change-success",
      },
    ),
  );
}

function* abortEmailUpdateEffect({ logger }: TGlobalDependencies): any {
  const user = yield select((s: TAppGlobalState) => selectUser(s));
  const email = user.verifiedEmail;
  logger.info("Email change aborted");
  yield neuCall(updateUser, { ...user, new_email: email });
  yield put(
    webNotificationUIModuleApi.actions.showInfo(
      createNotificationMessage(ProfileMessage.PROFILE_ABORT_UPDATE_EMAIL_SUCCESS),
      {
        "data-test-id": "profile-email-change-aborted",
      },
    ),
  );
}

function* resendEmailEffect({ logger }: TGlobalDependencies): any {
  const user = yield select((s: TAppGlobalState) => selectUser(s));
  const salt = yield select(selectLightWalletSalt);
  const email = user.unverifiedEmail;
  if (!email) throw new Error("No unverified email");

  logger.info("Email resent");
  yield neuCall(updateUser, { ...user, new_email: email, salt: salt });
  yield put(
    webNotificationUIModuleApi.actions.showInfo(
      createNotificationMessage(ProfileMessage.PROFILE_EMAIL_VERIFICATION_SENT),
    ),
  );
}

export function* addNewEmail(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.profile.addNewEmail>,
): Generator<any, any, any> {
  const email = action.payload.email;

  const isEmailAvailable = yield select((s: TAppGlobalState) => selectDoesEmailExist(s));
  const emailModalTitle = isEmailAvailable
    ? createMessage(ProfileMessage.PROFILE_UPDATE_EMAIL_TITLE)
    : createMessage(ProfileMessage.PROFILE_ADD_EMAIL_TITLE);

  const actualVerifiedEmail = yield select(selectVerifiedUserEmail);
  const actualUnverifiedEmail = yield select(selectUnverifiedUserEmail);

  if (email === actualVerifiedEmail) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(ProfileMessage.PROFILE_CHANGE_EMAIL_VERIFIED_EXISTS),
        {
          "data-test-id": "profile-email-change-verified-exists",
        },
      ),
    );
    return;
  }

  if (email === actualUnverifiedEmail) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(ProfileMessage.PROFILE_CHANGE_EMAIL_UNVERIFIED_EXISTS),
        {
          "data-test-id": "profile-email-change-unverified-exists",
        },
      ),
    );
    return;
  }

  try {
    yield put(actions.verifyEmail.lockVerifyEmailButton());
    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(addNewEmailEffect, email),
      [EJwtPermissions.CHANGE_EMAIL_PERMISSION],
      emailModalTitle,
      undefined,
      createMessage(ProfileMessage.PROFILE_ADD_EMAIL_INPUT_LABEL),
    );
  } catch (e) {
    if (e instanceof authModuleAPI.error.EmailAlreadyExists) {
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(ProfileMessage.PROFILE_EMAIL_ALREADY_EXISTS),
          {
            "data-test-id": "profile-email-exists",
          },
        ),
      );
    } else {
      logger.error("Failed to Add new email", e);
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(ProfileMessage.PROFILE_ADD_EMAIL_ERROR),
        ),
      );
    }
  } finally {
    yield put(actions.verifyEmail.freeVerifyEmailButton());
  }
}

export function* resendEmail({ logger }: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(resendEmailEffect),
      [EJwtPermissions.CHANGE_EMAIL_PERMISSION],
      createMessage(ProfileMessage.PROFILE_RESEND_EMAIL_LINK_CONFIRMATION_TITLE),
      undefined,
      createMessage(ProfileMessage.PROFILE_RESEND_EMAIL_LINK_CONFIRMATION_LABEL),
    );
  } catch (e) {
    logger.error("Failed to resend email", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(ProfileMessage.PROFILE_EMAIL_VERIFICATION_SENDING_FAILED),
      ),
    );
  }
}

export function* loadSeedOrReturnToSettings({
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  // unlock wallet
  try {
    const signEffect = put(actions.web3.fetchWalletPrivateDataFromWallet());
    return yield call(
      accessWalletAndRunEffect,
      signEffect,
      createMessage(ProfileMessage.PROFILE_ACCESS_RECOVERY_PHRASE_TITLE),
      createMessage(ProfileMessage.PROFILE_ACCESS_RECOVERY_PHRASE_DESCRIPTION),
    );
  } catch (error) {
    if (error instanceof MessageSignCancelledError) {
      logger.info("Signing Cancelled");
    } else {
      logger.error("Failed to load seed", error);
    }
    yield put(actions.routing.goToProfile());
  }
}

export function* abortEmailUpdate({ logger }: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.verifyEmail.lockVerifyEmailButton());
    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(abortEmailUpdateEffect),
      [EJwtPermissions.CHANGE_EMAIL_PERMISSION],
      createMessage(ProfileMessage.PROFILE_UPDATE_EMAIL_TITLE),
      undefined,
      createMessage(ProfileMessage.PROFILE_ADD_EMAIL_INPUT_LABEL),
    );
  } catch (e) {
    logger.error("Failed to cancel email change", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(ProfileMessage.PROFILE_ADD_EMAIL_ERROR),
      ),
    );
  } finally {
    yield put(actions.verifyEmail.freeVerifyEmailButton());
  }
}

export function* profileSagas(): any {
  yield fork(neuTakeEvery, actions.profile.addNewEmail, addNewEmail);
  yield fork(neuTakeEvery, actions.profile.resendEmail, resendEmail);
  yield fork(neuTakeEvery, actions.profile.loadSeedOrReturnToProfile, loadSeedOrReturnToSettings);
  yield fork(neuTakeEvery, actions.profile.abortEmailUpdate, abortEmailUpdate);
}
