import { authModuleAPI } from "@neufund/shared-modules";
import { ECountries, EthereumAddressWithChecksum } from "@neufund/shared-utils";
import { createSelector } from "reselect";

import { EKycRequestStatus } from "../../lib/api/kyc/KycApi.interfaces";
import { EUserType, IUser } from "../../lib/api/users/interfaces";
import { TAppGlobalState } from "../../store";
import {
  selectClientCountry,
  selectIsUserVerifiedOnBlockchain,
  selectKycRequestStatus,
} from "../kyc/selectors";
import { selectIsLightWallet } from "../web3/selectors";
import { EAuthStatus, IAuthState } from "./reducer";

export const selectAuthUser = (state: TAppGlobalState): IUser | undefined => state.auth.user;

export const selectAuthStatus = (state: TAppGlobalState): EAuthStatus => state.auth.status;

export const selectIsAuthorized = createSelector(
  authModuleAPI.selectors.selectJwt,
  selectAuthUser,
  selectAuthStatus,
  (jwt, user, status) => !!(jwt && user && status === EAuthStatus.AUTHORIZED),
);

export const selectUserType = (state: TAppGlobalState): EUserType | undefined =>
  state.auth.user && state.auth.user.type;

export const selectUserEmail = (state: IAuthState): string | undefined =>
  state.user && (state.user.unverifiedEmail || state.user.verifiedEmail);

export const selectVerifiedUserEmail = (state: IAuthState): string | undefined =>
  state.user && state.user.verifiedEmail;

export const selectUnverifiedUserEmail = (state: IAuthState): string | undefined =>
  state.user && state.user.unverifiedEmail;

export const selectUser = (state: TAppGlobalState): IUser | undefined => state.auth.user;

export const selectUserId = (state: TAppGlobalState): EthereumAddressWithChecksum | undefined =>
  state.auth.user && state.auth.user.userId;

export const selectBackupCodesVerified = (state: TAppGlobalState): boolean =>
  !!(state.auth.user && state.auth.user.backupCodesVerified) || !selectIsLightWallet(state.web3);

export const selectIsUserEmailVerified = (state: IAuthState): boolean =>
  !!state.user && !!state.user.verifiedEmail;

export const selectIsThereUnverifiedEmail = (state: IAuthState): boolean =>
  !!state.user && !!state.user.unverifiedEmail;

export const selectDoesEmailExist = (state: IAuthState): boolean =>
  selectIsThereUnverifiedEmail(state) || selectIsUserEmailVerified(state);

/**
 * Check if user has verified email and KYC
 */
export const selectIsUserVerified = (state: TAppGlobalState): boolean =>
  selectIsUserEmailVerified(state.auth) &&
  selectBackupCodesVerified(state) &&
  selectKycRequestStatus(state) === EKycRequestStatus.ACCEPTED;

/**
 * Check if user is verified by API and Contract
 */
export const selectIsUserFullyVerified = (state: TAppGlobalState): boolean =>
  selectIsUserVerified(state) && selectIsUserVerifiedOnBlockchain(state);

export const selectIsInvestor = (state: TAppGlobalState): boolean =>
  selectUserType(state) === EUserType.INVESTOR;

export const selectIsUSInvestor = (state: TAppGlobalState): boolean => {
  const isInvestor = selectIsInvestor(state);
  const country = selectClientCountry(state);

  return isInvestor && country === ECountries.UNITED_STATES;
};

/**
 * Investor is restricted when country of residence is blocked for some (often legal) reason
 * TODO: Connect both selectIsRestrictedInvestor and selectIsUsInvestor to single selector returning enum
 */
export const selectIsRestrictedInvestor = createSelector(
  selectIsInvestor,
  selectClientCountry,
  (isInvestor, country) => {
    if (isInvestor && country && process.env.NF_RESTRICTED_INVESTOR_COUNTRIES) {
      const restrictedCountries: string[] = process.env.NF_RESTRICTED_INVESTOR_COUNTRIES.split(
        ",",
      ).map(c => c.trim());

      return restrictedCountries.includes(country);
    }

    return false;
  },
);

export const selectIsIssuer = (state: TAppGlobalState): boolean =>
  selectUserType(state) === EUserType.ISSUER;

export const selectIsVerifiedInvestor = createSelector(
  selectIsInvestor,
  selectIsUserVerified,
  (isInvestor, isUserVerified) => isInvestor && isUserVerified,
);

// TOS Related Selectors

export const selectIsAgreementAccepted = (state: TAppGlobalState): boolean =>
  Boolean(state.auth.user && state.auth.user.latestAcceptedTosIpfs);
