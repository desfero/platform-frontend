import {
  addBigNumbers,
  ECountries,
  ETHEREUM_ZERO_ADDRESS,
  multiplyBigNumbers,
  NEUR_ALLOWED_US_STATES,
} from "@neufund/shared-utils";
import BigNumber from "bignumber.js";
import { createSelector } from "reselect";
import * as Web3Utils from "web3-utils";

import { EKycRequestType } from "../../lib/api/kyc/KycApi.interfaces";
import { TAppGlobalState } from "../../store";
import { selectIsUserFullyVerified } from "../auth/selectors";
import { selectIndividualAddress, selectKycRequestType } from "../kyc/selectors";
import { selectEtherPriceEur, selectNeuPriceEur } from "../shared/tokenPrice/selectors";
import { IWalletState, IWalletStateData } from "./reducer";
import { ENEURWalletStatus } from "./types";

export const selectWalletData = (state: TAppGlobalState): IWalletStateData | undefined =>
  state.wallet.data;

/**
 * Simple State Selectors
 */
export const selectNeuBalanceEuroAmount = (state: TAppGlobalState): string =>
  multiplyBigNumbers([selectNeuPriceEur(state), selectNeuBalance(state)]);

export const selectNeuBalance = (state: TAppGlobalState): string =>
  (state.wallet.data && state.wallet.data.neuBalance) || "0";

export const selectNeuBalanceEurEquiv = createSelector(
  selectNeuBalance,
  selectNeuPriceEur,
  (neuBalance, neuPriceEur) => multiplyBigNumbers([neuBalance, neuPriceEur]),
);

export const selectNeumarkAddress = (state: TAppGlobalState): string =>
  (state.wallet.data && state.wallet.data.neumarkAddress) || "0x";

export const selectEtherTokenBalance = (state: TAppGlobalState): string =>
  (state.wallet.data && state.wallet.data.etherTokenBalance) || "0";

export const selectEtherTokenBalanceAsBigNumber = (state: TAppGlobalState): BigNumber =>
  new BigNumber(selectEtherTokenBalance(state));

export const selectEtherBalance = (state: TAppGlobalState): string =>
  (state.wallet.data && state.wallet.data.etherBalance) || "0";

export const selectEtherBalanceAsBigNumber = (state: TAppGlobalState): BigNumber =>
  new BigNumber(selectEtherBalance(state));

/**
 * Liquid Assets
 */
export const selectLiquidEtherBalance = createSelector(
  selectWalletData,
  (data: IWalletStateData | undefined) =>
    data ? addBigNumbers([data.etherBalance, data.etherTokenBalance]) : "0",
);

export const selectLiquidEtherBalanceEuroAmount = (state: TAppGlobalState) =>
  multiplyBigNumbers([selectEtherPriceEur(state), selectLiquidEtherBalance(state)]);

export const selectLiquidEuroTokenBalance = createSelector(
  selectWalletData,
  (data: IWalletStateData | undefined) => (data && data.euroTokenBalance) || "0",
);

export const selectLiquidEuroTotalAmount = (state: TAppGlobalState) =>
  addBigNumbers([selectLiquidEuroTokenBalance(state), selectLiquidEtherBalanceEuroAmount(state)]);

/**
 * Locked Wallet Assets
 */
export const selectLockedEtherBalance = (state: TAppGlobalState) =>
  (state.wallet.data &&
    state.wallet.data.etherTokenLockedWallet &&
    state.wallet.data.etherTokenLockedWallet.LockedBalance) ||
  "0";

export const selectLockedEtherUnlockDate = (state: TAppGlobalState) =>
  (state.wallet.data &&
    state.wallet.data.etherTokenLockedWallet &&
    state.wallet.data.etherTokenLockedWallet.unlockDate) ||
  "0";

export const selectLockedEtherBalanceEuroAmount = (state: TAppGlobalState) =>
  multiplyBigNumbers([selectEtherPriceEur(state), selectLockedEtherBalance(state)]);

export const selectLockedEuroTokenBalance = createSelector(
  selectWalletData,
  (data: IWalletStateData | undefined) =>
    (data && data.euroTokenLockedWallet && data.euroTokenLockedWallet.LockedBalance) || "0",
);

export const selectLockedEuroTotalAmount = (state: TAppGlobalState) =>
  addBigNumbers([selectLockedEtherBalanceEuroAmount(state), selectLockedEuroTokenBalance(state)]);

export const selectEtherLockedWalletHasFunds = createSelector(
  selectLockedEtherBalance,
  etherLockedBalance => etherLockedBalance !== "0",
);

export const selectLockedWalletHasFunds = (state: TAppGlobalState): boolean =>
  selectLockedEuroTotalAmount(state) !== "0";

/**
 * ICBM Wallet Assets
 */
export const selectICBMLockedEtherBalance = (state: TAppGlobalState): string =>
  (state.wallet.data &&
    state.wallet.data.etherTokenICBMLockedWallet &&
    state.wallet.data.etherTokenICBMLockedWallet.LockedBalance) ||
  "0";

export const selectICBMLockedEtherBalanceEuroAmount = (state: TAppGlobalState) =>
  multiplyBigNumbers([selectEtherPriceEur(state), selectICBMLockedEtherBalance(state)]);

export const selectICBMLockedEuroTokenBalance = (state: TAppGlobalState) =>
  (state.wallet &&
    state.wallet.data &&
    state.wallet.data.euroTokenICBMLockedWallet &&
    state.wallet.data.euroTokenICBMLockedWallet.LockedBalance) ||
  "0";

export const selectICBMLockedEuroTotalAmount = (state: TAppGlobalState) =>
  addBigNumbers([
    selectICBMLockedEtherBalanceEuroAmount(state),
    selectICBMLockedEuroTokenBalance(state),
  ]);

export const selectICBMLockedWalletHasFunds = (state: TAppGlobalState): boolean =>
  addBigNumbers([selectICBMLockedEuroTokenBalance(state), selectICBMLockedEtherBalance(state)]) !==
  "0";

/**
 * Total wallet assets value
 */
export const selectTotalEtherBalance = (state: TAppGlobalState) =>
  addBigNumbers([
    selectLiquidEtherBalance(state),
    selectLockedEtherBalance(state),
    selectICBMLockedEtherBalance(state),
  ]);

export const selectTotalEtherBalanceEuroAmount = (state: TAppGlobalState) =>
  addBigNumbers([
    selectLiquidEtherBalanceEuroAmount(state),
    selectLockedEtherBalanceEuroAmount(state),
    selectICBMLockedEtherBalanceEuroAmount(state),
  ]);
export const selectTotalEuroTokenBalance = (state: TAppGlobalState) =>
  addBigNumbers([
    selectLiquidEuroTokenBalance(state),
    selectLockedEuroTokenBalance(state),
    selectICBMLockedEuroTokenBalance(state),
  ]);
export const selectTotalEuroBalance = (state: TAppGlobalState) =>
  addBigNumbers([
    selectLiquidEuroTotalAmount(state),
    selectLockedEuroTotalAmount(state),
    selectICBMLockedEuroTotalAmount(state),
  ]);

export const selectEtherLockedNeumarksDue = (state: TAppGlobalState): string =>
  (state.wallet.data &&
    state.wallet.data.etherTokenLockedWallet &&
    state.wallet.data.etherTokenLockedWallet.neumarksDue) ||
  "0";

export const selectEuroLockedNeumarksDue = (state: TAppGlobalState): string =>
  (state.wallet.data &&
    state.wallet.data.euroTokenLockedWallet &&
    state.wallet.data.euroTokenLockedWallet.neumarksDue) ||
  "0";

export const selectEtherNeumarksDue = (state: IWalletState): string =>
  (state.data &&
    state.data.etherTokenICBMLockedWallet &&
    state.data.etherTokenICBMLockedWallet.neumarksDue) ||
  "0";

export const selectEurNeumarksDue = (state: IWalletState): string =>
  (state.data &&
    state.data.euroTokenICBMLockedWallet &&
    state.data.euroTokenICBMLockedWallet.neumarksDue) ||
  "0";

export const selectIcbmWalletConnected = (state: IWalletState): boolean =>
  !!(
    (state.data && state.data.etherTokenICBMLockedWallet.unlockDate !== "0") ||
    (state.data && state.data.euroTokenICBMLockedWallet.unlockDate !== "0")
  );

export const selectLockedWalletConnected = (state: TAppGlobalState): boolean =>
  !!(
    (state.wallet.data && state.wallet.data.etherTokenLockedWallet.unlockDate !== "0") ||
    (state.wallet.data && state.wallet.data.euroTokenLockedWallet.unlockDate !== "0")
  );

export const selectIsLoading = (state: TAppGlobalState): boolean => state.wallet.loading;

export const selectWalletError = (state: TAppGlobalState): string | undefined => state.wallet.error;

export const selectIsEtherUpgradeTargetSet = (state: TAppGlobalState): boolean =>
  !!(
    state.wallet.data &&
    state.wallet.data.etherTokenUpgradeTarget &&
    Web3Utils.isAddress(state.wallet.data.etherTokenUpgradeTarget) &&
    state.wallet.data.etherTokenUpgradeTarget !== ETHEREUM_ZERO_ADDRESS
  );

export const selectIsEuroUpgradeTargetSet = (state: TAppGlobalState): boolean =>
  !!(
    state.wallet.data &&
    state.wallet.data.euroTokenUpgradeTarget &&
    Web3Utils.isAddress(state.wallet.data.euroTokenUpgradeTarget) &&
    state.wallet.data.euroTokenUpgradeTarget !== ETHEREUM_ZERO_ADDRESS
  );

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
