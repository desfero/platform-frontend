import { TAppGlobalState } from "../../store";
import { calculateGasPriceWithOverhead } from "../tx/utils";

export const selectStandardGasPriceWithOverHead = (state: TAppGlobalState): string =>
  (state.gas.gasPrice && calculateGasPriceWithOverhead(state.gas.gasPrice.standard)) || "0";
