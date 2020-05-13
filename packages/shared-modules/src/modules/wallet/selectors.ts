import { addBigNumbers, ETHEREUM_ZERO_ADDRESS, multiplyBigNumbers } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";
import { createSelector } from "reselect";
import * as Web3Utils from "web3-utils";

import { selectEtherPriceEur, selectNeuPriceEur } from "../token-price/selectors";
import { TWalletModuleState } from "./module";
import { IWalletState, IWalletStateData } from "./types";

export const selectWalletData = (state: TWalletModuleState): IWalletStateData | undefined =>
  state.wallet.data;

/**
 * Simple State Selectors
 */
export const selectNeuBalanceEuroAmount = (state: TWalletModuleState): string =>
  multiplyBigNumbers([selectNeuPriceEur(state), selectNeuBalance(state)]);

export const selectNeuBalance = (state: TWalletModuleState): string =>
  (state.wallet.data && state.wallet.data.neuBalance) || "0";

export const selectNeuBalanceEurEquiv = createSelector(
  selectNeuBalance,
  selectNeuPriceEur,
  (neuBalance, neuPriceEur) => multiplyBigNumbers([neuBalance, neuPriceEur]),
);

export const selectNeumarkAddress = (state: TWalletModuleState): string =>
  (state.wallet.data && state.wallet.data.neumarkAddress) || "0x";

export const selectEtherTokenBalance = (state: TWalletModuleState): string =>
  (state.wallet.data && state.wallet.data.etherTokenBalance) || "0";

export const selectEtherTokenBalanceAsBigNumber = (state: TWalletModuleState): BigNumber =>
  new BigNumber(selectEtherTokenBalance(state));

export const selectEtherBalance = (state: TWalletModuleState): string =>
  (state.wallet.data && state.wallet.data.etherBalance) || "0";

export const selectEtherBalanceAsBigNumber = (state: TWalletModuleState): BigNumber =>
  new BigNumber(selectEtherBalance(state));

/**
 * Liquid Assets
 */
export const selectLiquidEtherBalance = createSelector(
  selectWalletData,
  (data: IWalletStateData | undefined) =>
    data ? addBigNumbers([data.etherBalance, data.etherTokenBalance]) : "0",
);

export const selectLiquidEtherBalanceEuroAmount = (state: TWalletModuleState) =>
  multiplyBigNumbers([selectEtherPriceEur(state), selectLiquidEtherBalance(state)]);

export const selectLiquidEuroTokenBalance = createSelector(
  selectWalletData,
  (data: IWalletStateData | undefined) => (data && data.euroTokenBalance) || "0",
);

export const selectLiquidEuroTotalAmount = (state: TWalletModuleState) =>
  addBigNumbers([selectLiquidEuroTokenBalance(state), selectLiquidEtherBalanceEuroAmount(state)]);

/**
 * Locked Wallet Assets
 */
export const selectLockedEtherBalance = (state: TWalletModuleState) =>
  (state.wallet.data &&
    state.wallet.data.etherTokenLockedWallet &&
    state.wallet.data.etherTokenLockedWallet.LockedBalance) ||
  "0";

export const selectLockedEtherUnlockDate = (state: TWalletModuleState) =>
  (state.wallet.data &&
    state.wallet.data.etherTokenLockedWallet &&
    state.wallet.data.etherTokenLockedWallet.unlockDate) ||
  "0";

export const selectLockedEtherBalanceEuroAmount = (state: TWalletModuleState) =>
  multiplyBigNumbers([selectEtherPriceEur(state), selectLockedEtherBalance(state)]);

export const selectLockedEuroTokenBalance = createSelector(
  selectWalletData,
  (data: IWalletStateData | undefined) =>
    (data && data.euroTokenLockedWallet && data.euroTokenLockedWallet.LockedBalance) || "0",
);

export const selectLockedEuroTotalAmount = (state: TWalletModuleState) =>
  addBigNumbers([selectLockedEtherBalanceEuroAmount(state), selectLockedEuroTokenBalance(state)]);

export const selectEtherLockedWalletHasFunds = createSelector(
  selectLockedEtherBalance,
  etherLockedBalance => etherLockedBalance !== "0",
);

export const selectLockedWalletHasFunds = (state: TWalletModuleState): boolean =>
  selectLockedEuroTotalAmount(state) !== "0";

/**
 * ICBM Wallet Assets
 */
export const selectICBMLockedEtherBalance = (state: TWalletModuleState): string =>
  (state.wallet.data &&
    state.wallet.data.etherTokenICBMLockedWallet &&
    state.wallet.data.etherTokenICBMLockedWallet.LockedBalance) ||
  "0";

export const selectICBMLockedEtherBalanceEuroAmount = (state: TWalletModuleState) =>
  multiplyBigNumbers([selectEtherPriceEur(state), selectICBMLockedEtherBalance(state)]);

export const selectICBMLockedEuroTokenBalance = (state: TWalletModuleState) =>
  (state.wallet &&
    state.wallet.data &&
    state.wallet.data.euroTokenICBMLockedWallet &&
    state.wallet.data.euroTokenICBMLockedWallet.LockedBalance) ||
  "0";

export const selectICBMLockedEuroTotalAmount = (state: TWalletModuleState) =>
  addBigNumbers([
    selectICBMLockedEtherBalanceEuroAmount(state),
    selectICBMLockedEuroTokenBalance(state),
  ]);

export const selectICBMLockedWalletHasFunds = (state: TWalletModuleState): boolean =>
  addBigNumbers([selectICBMLockedEuroTokenBalance(state), selectICBMLockedEtherBalance(state)]) !==
  "0";

/**
 * Total wallet assets value
 */
export const selectTotalEtherBalance = (state: TWalletModuleState) =>
  addBigNumbers([
    selectLiquidEtherBalance(state),
    selectLockedEtherBalance(state),
    selectICBMLockedEtherBalance(state),
  ]);

export const selectTotalEtherBalanceEuroAmount = (state: TWalletModuleState) =>
  addBigNumbers([
    selectLiquidEtherBalanceEuroAmount(state),
    selectLockedEtherBalanceEuroAmount(state),
    selectICBMLockedEtherBalanceEuroAmount(state),
  ]);
export const selectTotalEuroTokenBalance = (state: TWalletModuleState) =>
  addBigNumbers([
    selectLiquidEuroTokenBalance(state),
    selectLockedEuroTokenBalance(state),
    selectICBMLockedEuroTokenBalance(state),
  ]);
export const selectTotalEuroBalance = (state: TWalletModuleState) =>
  addBigNumbers([
    selectLiquidEuroTotalAmount(state),
    selectLockedEuroTotalAmount(state),
    selectICBMLockedEuroTotalAmount(state),
  ]);

export const selectEtherLockedNeumarksDue = (state: TWalletModuleState): string =>
  (state.wallet.data &&
    state.wallet.data.etherTokenLockedWallet &&
    state.wallet.data.etherTokenLockedWallet.neumarksDue) ||
  "0";

export const selectEuroLockedNeumarksDue = (state: TWalletModuleState): string =>
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

export const selectLockedWalletConnected = (state: TWalletModuleState): boolean =>
  !!(
    (state.wallet.data && state.wallet.data.etherTokenLockedWallet.unlockDate !== "0") ||
    (state.wallet.data && state.wallet.data.euroTokenLockedWallet.unlockDate !== "0")
  );

export const selectIsLoading = (state: TWalletModuleState): boolean => state.wallet.loading;

export const selectWalletError = (state: TWalletModuleState): string | undefined =>
  state.wallet.error;

export const selectIsEtherUpgradeTargetSet = (state: TWalletModuleState): boolean =>
  !!(
    state.wallet.data &&
    state.wallet.data.etherTokenUpgradeTarget &&
    Web3Utils.isAddress(state.wallet.data.etherTokenUpgradeTarget) &&
    state.wallet.data.etherTokenUpgradeTarget !== ETHEREUM_ZERO_ADDRESS
  );

export const selectIsEuroUpgradeTargetSet = (state: TWalletModuleState): boolean =>
  !!(
    state.wallet.data &&
    state.wallet.data.euroTokenUpgradeTarget &&
    Web3Utils.isAddress(state.wallet.data.euroTokenUpgradeTarget) &&
    state.wallet.data.euroTokenUpgradeTarget !== ETHEREUM_ZERO_ADDRESS
  );
