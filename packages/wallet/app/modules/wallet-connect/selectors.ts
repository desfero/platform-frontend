import { StateFromReducersMapObject } from "redux";
import { createSelector } from "reselect";

import { walletConnectReducerMap } from "./reducer";

const selectWalletConnect = (state: StateFromReducersMapObject<typeof walletConnectReducerMap>) =>
  state.walletConnect;

const selectWalletConnectPeer = createSelector(
  selectWalletConnect,
  walletConnect => walletConnect.connectedPeer,
);

export { selectWalletConnectPeer };
