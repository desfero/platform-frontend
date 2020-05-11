import { EventChannel } from "@neufund/sagas";
import { createActionFactory } from "@neufund/shared-utils";

import { TMessage } from "../../../components/translatedMessages/utils";
import { TWalletConnectEvents } from "../../../lib/web3/wallet-connect/WalletConnectConnector";

export const walletConnectActions = {
  walletConnectLogin: createActionFactory("WALLET_CONNECT_LOGIN"),
  walletConnectInit: createActionFactory("WALLET_CONNECT_INIT"),
  walletConnectStop: createActionFactory("WALLET_CONNECT_STOP"),
  walletConnectStart: createActionFactory("WALLET_CONNECT_START"),
  walletConnectSessionRequest: createActionFactory(
    "WALLET_CONNECT_SESSION_REQUEST",
    (uri: string) => ({ uri }),
  ),
  walletConnectSessionRequestTimeout: createActionFactory("WALLET_CONNECT_SESSION_REQUEST_TIMEOUT"),
  walletConnectReady: createActionFactory("WALLET_CONNECT_READY"),
  walletConnectDisconnected: createActionFactory("WALLET_CONNECT_DISCONNECTED"),
  walletConnectRejected: createActionFactory("WALLET_CONNECT_REJECTED"),
  walletConnectError: createActionFactory("WALLET_CONNECT_ERROR", (error: TMessage) => ({ error })),
  walletConnectStartEventListeners: createActionFactory(
    "WALLET_CONNECT_START_EVENT_LISTENERS",
    (channel: EventChannel<TWalletConnectEvents>) => ({ channel }),
  ),
};
