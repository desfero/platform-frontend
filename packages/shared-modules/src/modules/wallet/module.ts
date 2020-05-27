import { generateSharedModuleId } from "../../utils";
import { setupTokenPriceModule } from "../token-price/module";
import { walletActions } from "./actions";
import { walletReducerMap } from "./reducer";
import { loadWalletDataAsync, setupWalletSagas } from "./sagas";
import * as selectors from "./selectors";
import { ILockedWallet, IWalletStateData } from "./types";
import * as utils from "./utils";

const MODULE_ID = generateSharedModuleId("wallet");

type Config = Parameters<typeof setupWalletSagas>[0];

const setupWalletModule = (config: Config) => {
  const module = {
    id: MODULE_ID,
    api: walletApi,
    sagas: [setupWalletSagas(config)],
    reducerMap: walletReducerMap,
  };

  return [setupTokenPriceModule({ refreshOnAction: undefined }), module];
};

const walletApi = {
  actions: walletActions,
  selectors,
  utils,
  sagas: {
    loadWalletDataAsync,
  },
};

export { setupWalletModule, walletApi, ILockedWallet, IWalletStateData };
