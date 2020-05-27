import { walletApi } from "@neufund/shared-modules";
import {
  compareBigNumbers,
  convertToUlps,
  ETH_DECIMALS,
  subtractBigNumbers,
} from "@neufund/shared-utils";
import { BigNumber } from "bignumber.js";

import { TAppGlobalState } from "../../../../store";
import { EInvestmentType } from "../../../investment-flow/reducer";
import { selectTxGasCostEthUlps } from "../../sender/selectors";

export const selectWalletBalance = (state: TAppGlobalState): string => {
  const investmentState = state.investmentFlow;

  // Select wallet balance based on investment type
  switch (investmentState.investmentType) {
    case EInvestmentType.Eth:
      // For ETH wallet estimated gas price have to be subtracted before
      const gasCostEth = selectTxGasCostEthUlps(state);
      const etherBalanceUlps = walletApi.selectors.selectLiquidEtherBalance(state);
      return subtractBigNumbers([etherBalanceUlps, gasCostEth]);
    case EInvestmentType.NEur:
      return walletApi.selectors.selectLiquidEuroTokenBalance(state);
    case EInvestmentType.ICBMEth:
      return walletApi.selectors.selectLockedEtherBalance(state);
    case EInvestmentType.ICBMnEuro:
      return walletApi.selectors.selectLockedEuroTokenBalance(state);
    default:
      return "0";
  }
};

export const isEther = (investmentType: EInvestmentType | undefined) => {
  switch (investmentType) {
    case EInvestmentType.Eth:
    case EInvestmentType.ICBMEth:
      return true;
    case EInvestmentType.NEur:
    case EInvestmentType.ICBMnEuro:
      return false;
    default:
      throw Error("Incorrect investment type");
  }
};

export const selectMaximumInvestment = (state: TAppGlobalState): string => {
  // Select investment state
  const investmentState = state.investmentFlow;
  const investmentType = investmentState.investmentType;

  // Select both ETH and EURO input values from state
  const selectedEthAmountUlps = investmentState.ethValueUlps || "0";
  const selectedEuroAmountUlps = investmentState.euroValueUlps || "0";

  // Select which input value should be used;
  const selectedAmountUlps = isEther(investmentType)
    ? selectedEthAmountUlps
    : selectedEuroAmountUlps;

  // Select wallet balance based of investment type
  const walletBalanceUlps = selectWalletBalance(state);
  const decimalsPrecision = isEther(investmentType) ? 4 : 2;

  // Round balance value to fixed number with precision based on investment type
  const roundedBalance = new BigNumber(walletBalanceUlps)
    .div(new BigNumber("10").pow(ETH_DECIMALS))
    .toFixed(decimalsPrecision, BigNumber.ROUND_DOWN);

  // Compare rounded balance to value provided by user
  // if both are the same use entire wallet balance
  // if not use value provided by user
  return compareBigNumbers(selectedAmountUlps, convertToUlps(roundedBalance)) === 0
    ? walletBalanceUlps
    : selectedAmountUlps;
};
