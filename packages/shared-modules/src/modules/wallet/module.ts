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

type Config = Parameters<typeof sagas.setupWalletSagas>[0];

const setupWalletModule = (config: Config) => {
  const module = {
    id: MODULE_ID,
    api: walletApi,
    libs: [],
    sagas: [sagas.setupWalletSagas(config)],
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
