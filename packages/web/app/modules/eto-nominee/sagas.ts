import { fork, put, select, take } from "@neufund/sagas";
import { EJwtPermissions } from "@neufund/shared-modules";

import {
  EEtoNomineeRequestMessages,
  EEtoNomineeRequestNotifications,
} from "../../components/translatedMessages/messages";
import {
  createMessage,
  createNotificationMessage,
} from "../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../di/setupBindings";
import { TNomineeRequestResponse } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { actions, TActionFromCreator } from "../actions";
import { ensurePermissionsArePresentAndRunEffect } from "../auth/jwt/sagas";
import { selectEtoNominee } from "../eto-flow/selectors";
import { ENomineeUpdateRequestStatus, TNomineeRequestStorage } from "../nominee-flow/types";
import { etoApiDataToNomineeRequests } from "../nominee-flow/utils";
import { webNotificationUIModuleApi } from "../notification-ui/module";
import { neuCall, neuTakeLatest, neuTakeUntil } from "../sagasUtils";

export function* etoGetNomineeRequests({
  apiEtoNomineeService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    const nomineeRequests: TNomineeRequestResponse[] = yield apiEtoNomineeService.etoGetNomineeRequest();
    const nomineeRequestsConverted: TNomineeRequestStorage = etoApiDataToNomineeRequests(
      nomineeRequests,
    );

    yield put(actions.etoNominee.storeNomineeRequests(nomineeRequestsConverted));
  } catch (e) {
    logger.error("Failed to load Nominee requests", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(EEtoNomineeRequestNotifications.GENERIC_NETWORK_ERROR),
      ),
    );
    yield put(actions.etoNominee.loadingDone());
  }
}

export function* etoNomineeRequestsWatcher({
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  while (true) {
    logger.info("Getting nominee requests");
    try {
      yield neuCall(etoGetNomineeRequests);
    } catch (e) {
      logger.error("Error getting nominee requests", e);
    }

    yield take(actions.web3.newBlockArrived.getType());
  }
}

export function* etoUpdateNomineeRequest(
  _: TGlobalDependencies,
  action:
    | TActionFromCreator<typeof actions.etoNominee.acceptNomineeRequest>
    | TActionFromCreator<typeof actions.etoNominee.rejectNomineeRequest>,
): Generator<any, any, any> {
  const options =
    action.type === actions.etoNominee.acceptNomineeRequest.getType()
      ? {
          newStatus: ENomineeUpdateRequestStatus.APPROVED,
          messageTitle: createMessage(EEtoNomineeRequestMessages.ISSUER_ACCEPT_NOMINEE_REQUEST),
          messageText: createMessage(EEtoNomineeRequestMessages.ISSUER_ACCEPT_NOMINEE_REQUEST_TEXT),
        }
      : {
          newStatus: ENomineeUpdateRequestStatus.REJECTED,
          messageTitle: createMessage(EEtoNomineeRequestMessages.ISSUER_DELETE_NOMINEE_REQUEST),
          messageText: createMessage(EEtoNomineeRequestMessages.ISSUER_DELETE_NOMINEE_REQUEST_TEXT),
        };
  try {
    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(etoUpdateNomineeRequestEffect, action.payload.nomineeId, options.newStatus),
      [EJwtPermissions.ISSUER_UPDATE_NOMINEE_REQUEST],
      options.messageTitle,
      options.messageText,
    );
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(EEtoNomineeRequestNotifications.GENERIC_NETWORK_ERROR),
      ),
    );
  } finally {
    yield put(actions.etoNominee.loadingDone());
  }
}

export function* etoUpdateNomineeRequestEffect(
  { apiEtoNomineeService, logger }: TGlobalDependencies,
  nomineeId: string,
  newStatus: ENomineeUpdateRequestStatus,
): Generator<any, any, any> {
  try {
    yield apiEtoNomineeService.etoUpdateNomineeRequest(nomineeId, newStatus);

    if (newStatus === ENomineeUpdateRequestStatus.APPROVED) {
      yield put(actions.etoFlow.loadIssuerEto());
    }
  } catch (e) {
    logger.error("Failed to update nominee request", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(EEtoNomineeRequestNotifications.UPDATE_NOMINEE_REQUEST_ERROR),
      ),
    );
  }
}

export function* etoRejectNomineeRequest(_: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(etoDeleteNomineeRequestEffect),
      [EJwtPermissions.ISSUER_REMOVE_NOMINEE],
      createMessage(EEtoNomineeRequestMessages.ISSUER_DELETE_NOMINEE_REQUEST),
      createMessage(EEtoNomineeRequestMessages.ISSUER_DELETE_NOMINEE_REQUEST_TEXT),
    );
    yield put(actions.etoNominee.loadingDone());
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(EEtoNomineeRequestNotifications.GENERIC_NETWORK_ERROR),
      ),
    );
  }
}

export function* etoDeleteNomineeRequestEffect({
  apiEtoNomineeService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  const nomineeId = yield select(selectEtoNominee);

  try {
    yield apiEtoNomineeService.etoDeleteNomineeRequest(nomineeId);
    yield put(actions.etoFlow.loadIssuerEto());
    yield put(
      webNotificationUIModuleApi.actions.showInfo(
        createNotificationMessage(EEtoNomineeRequestNotifications.DELETE_NOMINEE_REQUEST_SUCCESS),
      ),
    );
  } catch (e) {
    logger.error(`Error while trying to delete nominee request with nominee id ${nomineeId}`);
  }
}

export function* etoNomineeSagas(): Generator<any, any, any> {
  yield fork(neuTakeLatest, actions.etoNominee.getNomineeRequests, etoGetNomineeRequests);
  yield fork(neuTakeLatest, actions.etoNominee.acceptNomineeRequest, etoUpdateNomineeRequest);
  yield fork(neuTakeLatest, actions.etoNominee.rejectNomineeRequest, etoUpdateNomineeRequest);
  yield fork(
    neuTakeUntil,
    actions.etoNominee.startNomineeRequestsWatcher,
    actions.etoNominee.stopNomineeRequestsWatcher,
    etoNomineeRequestsWatcher,
  );
  yield fork(neuTakeLatest, actions.etoNominee.deleteNomineeRequest, etoRejectNomineeRequest);
}
