import { coreModuleApi, TLibSymbolType } from "@neufund/shared-modules";
import { ContainerModule } from "inversify";

import { AppSingleKeyStorage, storageModuleApi } from "../../storage";
import { WalletConnectManager } from "./WalletConnectManager";
import { WALLET_CONNECT_SESSION_KEY } from "./constants";
import { WalletSessionStorageSchema } from "./schemas";
import { privateSymbols } from "./symbols";

export function setupBindings(): ContainerModule {
  return new ContainerModule(bind => {
    bind<TLibSymbolType<typeof privateSymbols.walletConnectManager>>(
      privateSymbols.walletConnectManager,
    )
      .to(WalletConnectManager)
      .inSingletonScope();

    bind<TLibSymbolType<typeof privateSymbols.walletConnectSessionStorage>>(
      privateSymbols.walletConnectSessionStorage,
    )
      .toDynamicValue(
        ctx =>
          new AppSingleKeyStorage(
            ctx.container.get(storageModuleApi.symbols.appStorageProvider),
            ctx.container.get(coreModuleApi.symbols.logger),
            WALLET_CONNECT_SESSION_KEY,
            WalletSessionStorageSchema,
          ),
      )
      .inSingletonScope();
  });
}
