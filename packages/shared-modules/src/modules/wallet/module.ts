import { TModuleState } from "../../types";
import { generateSharedModuleId } from "../../utils";
import { setupTokenPriceModule } from "../token-price/module";
import { walletActions } from "./actions";
import { walletReducerMap } from "./reducer";
import * as sagas from "./sagas";
import * as selectors from "./selectors";
import * as utils from "./utils";

export { ENEURWalletStatus, ILockedWallet, IWalletStateData } from "./types";

const MODULE_ID = generateSharedModuleId("wallet");

const setupWalletModule = () => {
  const module = {
    id: MODULE_ID,
    api: walletApi,
    libs: [],
    sagas: [sagas.setupWalletSagas()],
    reducerMap: walletReducerMap,
  };

  return [setupTokenPriceModule({ refreshOnAction: undefined }), module];
};

const walletApi = {
  actions: walletActions,
  selectors,
  utils,
  sagas,
};

export { setupWalletModule, walletApi };

export type TWalletModuleState = TModuleState<typeof setupWalletModule>;
