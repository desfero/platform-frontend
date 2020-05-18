import { TLibSymbolType } from "@neufund/shared-modules";
import { ContainerModule } from "inversify";

import { Permissions } from "./Permissions";
import { symbols } from "./symbols";

export function setupBindings(): ContainerModule {
  return new ContainerModule(bind => {
    bind<TLibSymbolType<typeof symbols.permissions>>(symbols.permissions)
      .to(Permissions)
      .inSingletonScope();
  });
}
