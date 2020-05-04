import { fork, neuTakeLatest, SagaGenerator, TActionFromCreator } from "@neufund/sagas";
import { notificationUIModuleApi } from "@neufund/shared-modules";

import { showErrorToast, showInfoToast } from "../../components/shared/Toast";
import { getMessageTranslation } from "../../components/translatedMessages/messages";
import { TMessage } from "../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../di/setupBindings";

const actions = notificationUIModuleApi.actions;

function* showInfo(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions, typeof actions.showInfo>,
): SagaGenerator<void> {
  const { message, options } = action.payload;
  const translatedMessage = getMessageTranslation(message as TMessage);
  showInfoToast(translatedMessage, options);
}

function* showError(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions, typeof actions.showError>,
): SagaGenerator<void> {
  const { message, options } = action.payload;
  const translatedMessage = getMessageTranslation(message as TMessage);
  showErrorToast(translatedMessage, options);
}

export function* webNotificationUISaga(): SagaGenerator<void> {
  yield fork(neuTakeLatest, actions.showInfo, showInfo);
  yield fork(neuTakeLatest, actions.showError, showError);
}
