import { createLibSymbol } from "@neufund/shared-modules";

import { AppSingleKeyStorage } from "../../storage";
import { TEthAdapterFactoryType } from "./EthAdapter";
import { EthManager } from "./EthManager";
import { EthSecureEnclave } from "./EthSecureEnclave";
import { TEthWalletProviderType } from "./EthWallet";
import { EthWalletFactory } from "./EthWalletFactory";
import { TWalletMetadata } from "./schemas";

export const symbols = {
  ethManager: createLibSymbol<EthManager>("ethManager"),
};

export const privateSymbols = {
  rpcUrl: createLibSymbol<EthManager>("rpcUrl"),

  ethAdapterFactory: createLibSymbol<TEthAdapterFactoryType>("ethAdapterFactory"),
  ethWalletProvider: createLibSymbol<TEthWalletProviderType>("ethWalletProvider"),
  ethWalletFactory: createLibSymbol<EthWalletFactory>("ethWalletFactory"),
  ethSecureEnclave: createLibSymbol<EthSecureEnclave>("ethSecureEnclave"),

  walletStorage: createLibSymbol<AppSingleKeyStorage<TWalletMetadata>>("walletStorage"),
};
