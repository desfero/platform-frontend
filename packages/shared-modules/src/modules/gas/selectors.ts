import { GasModelShape } from "./lib/http/gas-api/GasApi";
import { TGasModuleState } from "./types";

export const selectIsGasPriceAlreadyLoaded = (state: TGasModuleState): boolean =>
  !state.gas.loading && !!state.gas.gasPrice;

export const selectGasPrice = (state: TGasModuleState): GasModelShape | undefined =>
  state.gas.gasPrice;

export const selectStandardGasPrice = (state: TGasModuleState): string =>
  (state.gas.gasPrice && state.gas.gasPrice.standard) || "0";
