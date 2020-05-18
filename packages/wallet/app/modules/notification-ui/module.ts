import { notificationUIModuleApi } from "@neufund/shared-modules";

import { notificationUISaga } from "./sagas";

const MODULE_ID = "wallet:notification-ui";

const setupNotificationUIModule = () => ({
  id: MODULE_ID,
  sagas: [notificationUISaga],
  api: notificationUIModuleApi,
});

export { setupNotificationUIModule, notificationUIModuleApi };
