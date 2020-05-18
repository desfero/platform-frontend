import { notificationUIModuleApi } from "@neufund/shared-modules";

import { webNotificationUISaga } from "./sagas";

const MODULE_ID = "web:notification-ui";

const setupWebNotificationUIModule = () => ({
  id: MODULE_ID,
  sagas: [webNotificationUISaga],
  api: webNotificationUIModuleApi,
});

const webNotificationUIModuleApi = notificationUIModuleApi;
export { setupWebNotificationUIModule, webNotificationUIModuleApi };
