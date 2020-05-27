import { gasApi } from "@neufund/shared-modules";
import { multiplyBigNumbers } from "@neufund/shared-utils";

import { TAppGlobalState } from "../../../store";
import { selectEtherPriceEur } from "../../shared/tokenPrice/selectors";
import { ETxSenderType, TAdditionalDataByType } from "../types";
import { calculateGasPriceWithOverhead } from "../utils";
import { ETxSenderState } from "./reducer";

export const selectTxSenderModalOpened = (state: TAppGlobalState) =>
  state.txSender.state !== ETxSenderState.UNINITIALIZED;

export const selectTxDetails = (state: TAppGlobalState) => state.txSender.txDetails;

export const selectTxType = (state: TAppGlobalState) => state.txSender.type;

export const selectTxAdditionalData = <T extends ETxSenderType>(
  state: TAppGlobalState,
): TAdditionalDataByType<T> | undefined => state.txSender.additionalData;

export const selectTxTimestamp = (state: TAppGlobalState): number | undefined =>
  state.txSender.txTimestamp;

export const selectTxGasCostEthUlps = (state: TAppGlobalState): string => {
  const details = selectTxDetails(state);
  const gasPrice = details?.gasPrice ?? "0";
  const gasLimit = details?.gas ?? "0";
  return multiplyBigNumbers([gasPrice, gasLimit]);
};

export const selectTxGasCostEurUlps = (state: TAppGlobalState): string =>
  multiplyBigNumbers([selectEtherPriceEur(state), selectTxGasCostEthUlps(state)]);

export const selectStandardGasPriceWithOverHead = (state: TAppGlobalState): string =>
  calculateGasPriceWithOverhead(gasApi.selectors.selectStandardGasPrice(state));
