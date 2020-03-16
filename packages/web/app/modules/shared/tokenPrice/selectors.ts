import { assertNever, ECurrency, multiplyBigNumbers } from "@neufund/shared";

import { TAppGlobalState } from "../../../store";
import { ITokenPriceStateData } from "./reducer";

export const selectTokenPriceData = (state: TAppGlobalState): ITokenPriceStateData | undefined =>
  state.tokenPrice.tokenPriceData;

export const selectEtherPriceEur = (state: TAppGlobalState): string => {
  const data = selectTokenPriceData(state);
  return (data && data.etherPriceEur) || "0";
};

export const selectNeuPriceEur = (state: TAppGlobalState): string => {
  const data = selectTokenPriceData(state);
  return (data && data.neuPriceEur) || "0";
};

export const selectEurPriceEther = (state: TAppGlobalState): string => {
  const data = selectTokenPriceData(state);
  return (data && data.eurPriceEther) || "0";
};

export const selectEurEquivalent = (
  state: TAppGlobalState,
  amount: string,
  currency: ECurrency,
) => {
  switch (currency) {
    case ECurrency.NEU:
      return multiplyBigNumbers([selectNeuPriceEur(state), amount]);
    case ECurrency.EUR:
    case ECurrency.EUR_TOKEN:
      return amount;
    case ECurrency.ETH:
      return multiplyBigNumbers([selectEtherPriceEur(state), amount]);
    default:
      return assertNever(currency, `Not able to calculate Eur equivalent for ${currency}`);
  }
};
