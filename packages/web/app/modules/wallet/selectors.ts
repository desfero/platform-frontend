import { ENEURWalletStatus } from "@neufund/shared-modules";
import { ECountries, NEUR_ALLOWED_US_STATES } from "@neufund/shared-utils";

import { EKycRequestType } from "../../lib/api/kyc/KycApi.interfaces";
import { TAppGlobalState } from "../../store";
import { selectIsUserFullyVerified } from "../auth/selectors";
import { selectIndividualAddress, selectKycRequestType } from "../kyc/selectors";

export const selectNEURStatus = (state: TAppGlobalState): ENEURWalletStatus => {
  const isUserFullyVerified = selectIsUserFullyVerified(state);

  if (!isUserFullyVerified) {
    return ENEURWalletStatus.DISABLED_NON_VERIFIED;
  }

  const kycType = selectKycRequestType(state);
  const address = selectIndividualAddress(state);

  // In case it's Individual request and country is US we need to apply additional checks
  if (
    kycType === EKycRequestType.INDIVIDUAL &&
    address &&
    address.country === ECountries.UNITED_STATES
  ) {
    // It's likely possible `usState` is not defined but in case it's is assume NEUR access is restricted
    if (address.usState === undefined || !NEUR_ALLOWED_US_STATES.includes(address.usState)) {
      return ENEURWalletStatus.DISABLED_RESTRICTED_US_STATE;
    }
  }

  return ENEURWalletStatus.ENABLED;
};
