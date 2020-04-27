import { createLibSymbol } from "@neufund/shared-modules";

import { SessionStorageAdapter } from "./SessionStorageAdapter";
import { WalletConnectManager } from "./WalletConnectManager";

export const symbols = {};

export const privateSymbols = {
  walletConnectManager: createLibSymbol<WalletConnectManager>("walletConnectManager"),
  walletConnectSessionStorage: createLibSymbol<SessionStorageAdapter>(
    "walletConnectSessionStorage",
  ),
};
