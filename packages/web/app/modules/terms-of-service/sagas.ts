import { call, fork, put, SagaGenerator } from "@neufund/sagas";
import { authModuleAPI, EJwtPermissions, neuGetBindings } from "@neufund/shared-modules";

import { hashFromIpfsLink } from "../../components/documents/utils";
import { AuthMessage, ToSMessage } from "../../components/translatedMessages/messages";
import {
  createMessage,
  createNotificationMessage,
} from "../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../di/setupBindings";
import { actions } from "../actions";
import { ensurePermissionsArePresentAndRunEffect } from "../auth/jwt/sagas";
import { waitUntilSmartContractsAreInitialized } from "../init/sagas";
import { webNotificationUIModuleApi } from "../notification-ui/module";
import { neuCall, neuTakeEvery } from "../sagasUtils";

/**
 * Handle ToS / agreement
 */
export function* getCurrentAgreementHash({
  contractsService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  yield waitUntilSmartContractsAreInitialized();

  logger.info("Loading current agreement hash");

  try {
    const result = yield contractsService.universeContract.currentAgreement();
    let currentAgreementHash = result[2] as string;
    return hashFromIpfsLink(currentAgreementHash);
  } catch (e) {
    logger.error("Could not load current agreement", e);
    throw e;
  }
}

function* handleAcceptCurrentAgreementEffect(): SagaGenerator<void> {
  const { apiUserService } = yield* neuGetBindings({
    apiUserService: authModuleAPI.symbols.apiUserService,
  });

  const currentAgreementHash = yield* neuCall(getCurrentAgreementHash);

  const user = yield* call(apiUserService.setLatestAcceptedTos, currentAgreementHash);

  yield put(authModuleAPI.actions.setUser(user));
}

export function* handleAcceptCurrentAgreement({
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(handleAcceptCurrentAgreementEffect),
      [EJwtPermissions.SIGN_TOS],
      createMessage(ToSMessage.TOS_ACCEPT_PERMISSION_TITLE),
      createMessage(ToSMessage.TOS_ACCEPT_PERMISSION_TEXT),
    );
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(AuthMessage.AUTH_TOC_ACCEPT_ERROR),
      ),
    );
    logger.error("Could not accept Terms and Conditions", e);
  }
}

export const termsOfServiceSagas = function*(): Generator<any, any, any> {
  yield fork(neuTakeEvery, actions.tosModal.acceptCurrentTos, handleAcceptCurrentAgreement);
};
