import { GasModelShape } from "./lib/http/gas-api/GasApi";
import { TModuleState } from "./reducer";

export const selectIsGasPriceAlreadyLoaded = (state: TModuleState): boolean =>
  !state.gas.loading && !!state.gas.gasPrice;

export const selectGasPrice = (state: TModuleState): GasModelShape | undefined =>
  state.gas.gasPrice;

export const selectStandardGasPrice = (state: TModuleState): string =>
  (state.gas.gasPrice && state.gas.gasPrice.standard) || "0";
