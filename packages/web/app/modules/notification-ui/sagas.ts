import { fork, neuTakeLatest, SagaGenerator, TActionFromCreator } from "@neufund/sagas";
import { notificationUIModuleApi } from "@neufund/shared-modules";

import { showErrorToast, showInfoToast } from "../../components/shared/Toast";
import { TGlobalDependencies } from "../../di/setupBindings";
import { TTranslatedString } from "../../types";

const actions = notificationUIModuleApi.actions;

function* showInfo(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions, typeof actions.showInfo>,
): SagaGenerator<void> {
  const { message, options } = action.payload;
  showInfoToast(message as TTranslatedString, options);
}

function* showError(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions, typeof actions.showError>,
): SagaGenerator<void> {
  const { message, options } = action.payload;
  showErrorToast(message as TTranslatedString, options);
}

export function* webNotificationUISaga(): SagaGenerator<void> {
  yield fork(neuTakeLatest, actions.showInfo, showInfo);
  yield fork(neuTakeLatest, actions.showError, showError);
}
