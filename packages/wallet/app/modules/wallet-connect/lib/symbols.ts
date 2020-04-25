import { createLibSymbol } from "@neufund/shared-modules";

import { SessionStorageAdapter } from "./SessionStorageAdapter";
import { TWalletConnectManagerFactoryType } from "./WalletConnectManager";

export const symbols = {};

export const privateSymbols = {
  walletConnectManagerFactory: createLibSymbol<TWalletConnectManagerFactoryType>(
    "walletConnectManagerFactory",
  ),
  walletConnectSessionStorage: createLibSymbol<SessionStorageAdapter>(
    "walletConnectSessionStorage",
  ),
};
