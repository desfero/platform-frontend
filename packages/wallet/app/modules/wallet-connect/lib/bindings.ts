import { TLibSymbolType } from "@neufund/shared-modules";
import { ContainerModule } from "inversify";

import { walletConnectManagerFactory } from "./WalletConnectManager";
import { privateSymbols } from "./symbols";

export function setupBindings(): ContainerModule {
  return new ContainerModule(bind => {
    bind<TLibSymbolType<typeof privateSymbols.walletConnectManagerFactory>>(
      privateSymbols.walletConnectManagerFactory,
    ).toFactory(walletConnectManagerFactory);
  });
}
