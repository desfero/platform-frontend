import { walletConnectActions } from "./actions";
import { setupBindings } from "./lib/bindings";
import { walletConnectReducerMap } from "./reducer";
import { walletConnectSaga } from "./sagas";
import { selectWalletConnectPeer } from "./selectors";

const MODULE_ID = "wallet:wallet-connect";

const setupWalletConnectModule = () => ({
  id: MODULE_ID,
  libs: [setupBindings()],
  sagas: [walletConnectSaga],
  reducerMap: walletConnectReducerMap,
  api: walletConnectModuleApi,
});

const walletConnectModuleApi = {
  actions: walletConnectActions,
  selectors: {
    selectWalletConnectPeer,
  },
};

export { setupWalletConnectModule, walletConnectModuleApi };
