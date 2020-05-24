import { createLibSymbol } from "@neufund/shared-modules";

import { FirebaseProvider } from "./FirebaseProvider";
import { Notifications } from "./Notifications";

export const symbols = {
  notificationsProvider: createLibSymbol<FirebaseProvider>("notificationsProvider"),
  notifications: createLibSymbol<Notifications>("notifications"),
};
