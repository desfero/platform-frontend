import { createActionFactory } from "@neufund/shared-utils";

const payloadCreator = (message: unknown, options?: any) => ({
  message,
  options,
});

export const notificationUIActions = {
  showInfo: createActionFactory("NOTIFICATION_UI_SHOW_INFO", payloadCreator),
  showError: createActionFactory("NOTIFICATION_UI_SHOW_ERROR", payloadCreator),
};
