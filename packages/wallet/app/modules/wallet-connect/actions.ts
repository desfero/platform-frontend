import { createActionFactory } from "@neufund/shared-utils";

import { TWalletConnectPeer } from "./types";

export const walletConnectActions = {
  /**
   * Connection flow
   */
  connectToPeer: createActionFactory("WC_CONNECT_TO_PEER", (uri: string) => ({
    uri,
  })),
  connectedToPeer: createActionFactory("WC_CONNECTED_TO_PEER", (peer: TWalletConnectPeer) => ({
    peer,
  })),
  tryToConnectExistingSession: createActionFactory("WC_TRY_CONNECT_EXISTING"),

  /**
   * Disconnect flow
   */
  disconnectFromPeer: createActionFactory("WC_DISCONNECT_FROM_PEER", (peerId: string) => ({
    peerId,
  })),
  disconnectedFromPeer: createActionFactory("WC_DISCONNECTED_FROM_PEER", (peerId: string) => ({
    peerId,
  })),
};
