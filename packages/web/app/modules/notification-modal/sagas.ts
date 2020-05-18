import { fork, put } from "@neufund/sagas";
import { assertNever } from "@neufund/shared-utils";

import { createNotificationMessage } from "../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../di/setupBindings";
import { actions, TActionFromCreator } from "../actions";
import { webNotificationUIModuleApi } from "../notification-ui/module";
import { neuTakeEvery } from "../sagasUtils";
import { ENotificationModalType } from "./actions";

export function* showNotification(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.notificationModal.notify>,
): Generator<any, any, any> {
  if (action.type !== "NOTIFY") return;

  const { type, message } = action.payload;
  const { messageType, messageData } = message;

  switch (type) {
    case ENotificationModalType.ERROR:
      return yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(messageType, messageData),
        ),
      );
    case ENotificationModalType.INFO:
      return yield put(
        webNotificationUIModuleApi.actions.showInfo(
          createNotificationMessage(messageType, messageData),
        ),
      );
    default:
      assertNever(type, "unknown notification type");
  }
}

export function* notificationModalSagas(): Generator<any, any, any> {
  yield fork(neuTakeEvery, actions.notificationModal.notify, showNotification);
}
