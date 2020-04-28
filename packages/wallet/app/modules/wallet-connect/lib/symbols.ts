import { createLibSymbol } from "@neufund/shared-modules";
import { AppSingleKeyStorage } from "../../storage";
import { TWalletSession } from "./schemas";

import { WalletConnectManager } from "./WalletConnectManager";

export const symbols = {};

export const privateSymbols = {
  walletConnectManager: createLibSymbol<WalletConnectManager>("walletConnectManager"),
  walletConnectSessionStorage: createLibSymbol<AppSingleKeyStorage<TWalletSession>>(
    "walletConnectSessionStorage",
  ),
};
