import { multiplyBigNumbers } from "@neufund/shared-utils";

import { ETxType } from "../../../lib/web3/types";
import { TAppGlobalState } from "../../../store";
import { selectEtherPriceEur } from "../../shared/tokenPrice/selectors";
import { TAdditionalDataByType } from "../types";
import { ETxSenderState } from "./reducer";

export const selectTxSenderModalOpened = (state: TAppGlobalState) =>
  state.txSender.state !== ETxSenderState.UNINITIALIZED;

export const selectTxDetails = (state: TAppGlobalState) => state.txSender.txDetails;

export const selectTxType = (state: TAppGlobalState) => state.txSender.type;

export const selectTxAdditionalData = <T extends ETxType>(
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
