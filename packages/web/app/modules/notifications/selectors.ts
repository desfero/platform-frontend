import { includes, some } from "lodash";
import { createSelector } from "reselect";

import { appRoutes } from "../../components/appRoutes";
import { EKycRequestStatus } from "../../lib/api/kyc/KycApi.interfaces";
import { EUserType } from "../../lib/api/users/interfaces";
import { TAppGlobalState } from "../../store";
import {
  selectBackupCodesVerified,
  selectIsInvestor,
  selectIsUserEmailVerified,
  selectUserType,
} from "../auth/selectors";
import { selectKycIsLoading, selectKycRequestStatus } from "../kyc/selectors";
import { settingsNotificationInvestor, settingsNotificationIssuer } from "./reducer";
import { INotification } from "./types";

export const selectNotifications = (state: TAppGlobalState): ReadonlyArray<INotification> =>
  state.notifications.notifications;

export const selectIsActionRequiredSettings = (state: TAppGlobalState): boolean => {
  if (selectKycIsLoading(state)) {
    return false;
  }
  return (
    !selectIsUserEmailVerified(state.auth) ||
    !selectBackupCodesVerified(state) ||
    !includes(
      [EKycRequestStatus.OUTSOURCED, EKycRequestStatus.PENDING, EKycRequestStatus.ACCEPTED],
      selectKycRequestStatus(state),
    )
  );
};

/**
 * Hides notification on blacklisted routes.
 */
export const selectIsVisibleSecurityNotification = (state: TAppGlobalState): boolean => {
  const disallowedViewsPaths = [appRoutes.profile, appRoutes.kyc];
  const userType = selectUserType(state);

  if (userType === EUserType.NOMINEE) {
    return false;
  }

  if (
    state.router.location &&
    some(disallowedViewsPaths, p => state.router.location.pathname.startsWith(p))
  ) {
    return false;
  }

  return selectIsActionRequiredSettings(state);
};

export const selectSettingsNotificationType = createSelector(selectIsInvestor, isInvestor =>
  isInvestor ? settingsNotificationInvestor() : settingsNotificationIssuer(),
);

export const selectSettingsNotification = (state: TAppGlobalState) =>
  selectIsVisibleSecurityNotification(state) ? selectSettingsNotificationType(state) : undefined;

export const selectNotificationsWithDerived = createSelector(
  selectNotifications,
  selectSettingsNotification,
  (notifications, settingsNotification) =>
    settingsNotification ? notifications.concat(settingsNotification) : notifications,
);
