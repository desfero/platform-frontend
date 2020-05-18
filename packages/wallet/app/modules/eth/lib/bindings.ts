import { coreModuleApi, TLibSymbolType } from "@neufund/shared-modules";
import { ContainerModule } from "inversify";

import { AppSingleKeyStorage, storageModuleApi } from "../../storage";
import { ethAdapterFactory } from "./EthAdapter";
import { EthManager } from "./EthManager";
import { EthSecureEnclave } from "./EthSecureEnclave";
import { ethWalletProvider } from "./EthWallet";
import { EthWalletFactory } from "./EthWalletFactory";
import { WALLET_METADATA_KEY } from "./constants";
import { WalletMetadataStorageSchema } from "./schemas";
import { privateSymbols, symbols } from "./symbols";

export function setupBindings(rpcUrl: string): ContainerModule {
  return new ContainerModule(bind => {
    bind<string>(privateSymbols.rpcUrl).toConstantValue(rpcUrl);

    bind<TLibSymbolType<typeof symbols.ethManager>>(symbols.ethManager)
      .to(EthManager)
      .inSingletonScope();

    bind<TLibSymbolType<typeof privateSymbols.walletStorage>>(
      privateSymbols.walletStorage,
    ).toDynamicValue(
      ctx =>
        new AppSingleKeyStorage(
          ctx.container.get(storageModuleApi.symbols.appStorageProvider),
          ctx.container.get(coreModuleApi.symbols.logger),
          WALLET_METADATA_KEY,
          WalletMetadataStorageSchema,
        ),
    );

    bind<TLibSymbolType<typeof privateSymbols.ethAdapterFactory>>(
      privateSymbols.ethAdapterFactory,
    ).toFactory(ethAdapterFactory);

    bind<TLibSymbolType<typeof privateSymbols.ethWalletProvider>>(
      privateSymbols.ethWalletProvider,
    ).toFactory(ethWalletProvider);

    bind<TLibSymbolType<typeof privateSymbols.ethWalletFactory>>(privateSymbols.ethWalletFactory)
      .to(EthWalletFactory)
      .inSingletonScope();

    bind<TLibSymbolType<typeof privateSymbols.ethSecureEnclave>>(privateSymbols.ethSecureEnclave)
      .to(EthSecureEnclave)
      .inSingletonScope();
  });
}
