import { createActionFactory } from "@neufund/shared-utils";

import { ELogoutReason } from "../types";

type TLogoutActionOptions = {
  logoutType?: ELogoutReason;
};

export const authUserActions = {
  finishSigning: createActionFactory("AUTH_FINISH_SIGNING"),
  logout: createActionFactory("AUTH_LOGOUT", (options: TLogoutActionOptions = {}) => options),
  logoutDone: createActionFactory("AUTH_LOGOUT_DONE"),
  userActive: createActionFactory("AUTH_USER_ACTIVE"),
  userActivityTimeout: createActionFactory("AUTH_USER_TIMEOUT"),
  refreshTimer: createActionFactory("AUTH_REFRESH_TIMER"),
  stopProfileMonitor: createActionFactory("STOP_PROFILE_MONITOR"),
  stopUserActivityWatcher: createActionFactory("STOP_USER_ACTIVITY_WATCHER"),
};
