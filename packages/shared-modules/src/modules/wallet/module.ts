import { TModuleState } from "../../types";
import { generateSharedModuleId } from "../../utils";
import { setupTokenPriceModule } from "../token-price/module";
import { walletActions } from "./actions";
import { walletReducerMap } from "./reducer";
import { setupWalletSagas } from "./sagas";
import * as selectors from "./selectors";
export { ENEURWalletStatus } from "./types";

const MODULE_ID = generateSharedModuleId("wallet");

const setupWalletModule = () => {
  const module = {
    id: MODULE_ID,
    api: walletApi,
    libs: [],
    sagas: [setupWalletSagas()],
    reducerMap: walletReducerMap,
  };

  return [setupTokenPriceModule({ refreshOnAction: undefined }), module];
};

const walletApi = {
  actions: walletActions,
  selectors,
};

export { setupWalletModule, walletApi };

export type TWalletModuleState = TModuleState<typeof setupWalletModule>;
