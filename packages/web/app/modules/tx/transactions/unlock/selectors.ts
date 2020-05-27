import { walletApi } from "@neufund/shared-modules";
import BigNumber from "bignumber.js";
import { createSelector } from "reselect";

const selectUserHasEnoughNeumarkToUnlock = createSelector(
  walletApi.selectors.selectNeuBalance,
  walletApi.selectors.selectEtherLockedNeumarksDue,
  (neuBalance, neumarksDue) => {
    const neuCompare = new BigNumber(neuBalance).comparedTo(neumarksDue);
    return neuCompare >= 0;
  },
);

export const selectCanUnlockWallet = createSelector(
  selectUserHasEnoughNeumarkToUnlock,
  walletApi.selectors.selectEtherLockedWalletHasFunds,
  (etherWalletHasEnoughNeumark, etherWalletHasFunds) =>
    etherWalletHasFunds && etherWalletHasEnoughNeumark,
);
