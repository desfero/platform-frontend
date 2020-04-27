import { TLibSymbolType } from "@neufund/shared-modules";
import { ContainerModule } from "inversify";

import { SessionStorageAdapter } from "./SessionStorageAdapter";
import { WalletConnectManager } from "./WalletConnectManager";
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
      .to(SessionStorageAdapter)
      .inSingletonScope();
  });
}
