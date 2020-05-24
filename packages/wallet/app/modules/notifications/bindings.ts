import { TLibSymbolType } from "@neufund/shared-modules";
import { ContainerModule } from "inversify";

import { FirebaseProvider } from "./FirebaseProvider";
import { Notifications } from "./Notifications";
import { symbols } from "./symbols";

export function setupBindings(): ContainerModule {
  return new ContainerModule(bind => {
    bind<TLibSymbolType<typeof symbols.notifications>>(symbols.notifications)
      .to(Notifications)
      .inSingletonScope();

    bind<TLibSymbolType<typeof symbols.notificationsProvider>>(symbols.notificationsProvider)
      .to(FirebaseProvider)
      .inSingletonScope();
  });
}
