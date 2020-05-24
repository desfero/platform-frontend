import { createLibSymbol } from "@neufund/shared-modules";

import { TWalletConnectManagerFactoryType } from "./WalletConnectManager";

export const symbols = {};

export const privateSymbols = {
  walletConnectManagerFactory: createLibSymbol<TWalletConnectManagerFactoryType>(
    "walletConnectManagerFactory",
  ),
};
