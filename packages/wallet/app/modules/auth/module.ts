import { setupAuthModule as setupSharedAuthModule } from "@neufund/shared-modules";

import { walletEthModuleApi } from "../eth/module";
import { authActions } from "./actions";
import { setupBindings } from "./lib/bindings";
import { privateSymbols } from "./lib/symbols";
import { authReducerMap, EAuthState } from "./reducer";
import { authSaga, trySignInExistingAccount } from "./sagas";
import { selectAuthState, selectAuthWallet, selectUser } from "./selectors";
import type { TAuthWalletMetadata } from "./types";

const MODULE_ID = "wallet:auth";

const setupAuthModule = () => {
  const authModule = {
    id: MODULE_ID,
    sagas: [authSaga],
    reducerMap: authReducerMap,
    libs: [setupBindings()],
    api: authModuleAPI,
  };

  return [
    setupSharedAuthModule({
      jwtStorageSymbol: privateSymbols.jwtStorage,
      ethManagerSymbol: walletEthModuleApi.symbols.ethManager,
    }),
    authModule,
  ];
};

const authModuleAPI = {
  actions: authActions,
  selectors: {
    selectAuthState,
    selectAuthWallet,
    selectUser,
  },
  sagas: {
    trySignInExistingAccount,
  },
};

export type { TAuthWalletMetadata };
export { setupAuthModule, authModuleAPI, EAuthState };
