import { coreModuleApi, TLibSymbolType } from "@neufund/shared-modules";
import { ContainerModule } from "inversify";

import { AppSingleKeyStorage, storageModuleApi } from "modules/storage";

import { JWT_KEY } from "./constants";
import { JWTStorageSchema } from "./schemas";
import { privateSymbols } from "./symbols";

export function setupBindings(): ContainerModule {
  return new ContainerModule(bind => {
    bind<TLibSymbolType<typeof privateSymbols.jwtStorage>>(
      privateSymbols.jwtStorage,
    ).toDynamicValue(
      ctx =>
        new AppSingleKeyStorage(
          ctx.container.get(storageModuleApi.symbols.appStorageProvider),
          ctx.container.get(coreModuleApi.symbols.logger),
          JWT_KEY,
          JWTStorageSchema,
        ),
    );
  });
}
