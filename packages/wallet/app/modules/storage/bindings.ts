import { coreModuleApi, TLibSymbolType } from "@neufund/shared-modules";
import { ContainerModule } from "inversify";
import * as yup from "yup";

import { AppStorage } from "./classes/AppStorage";
import { AsyncStorageProvider } from "./classes/AsyncStorageProvider";
import { StorageSchema } from "./classes/StorageSchema";
import { symbols } from "./symbols";

// TODO: this is a dummy mock. Replace with real storage. e.g. WalletStorage
const PersonSchema = yup.object().shape({
  name: yup.string(),
  age: yup.number(),
});

// get a type for TS from Yup object
type Person = yup.InferType<typeof PersonSchema>;

const personSchema = new StorageSchema(1, "PersonSchema", PersonSchema);

export function setupBindings(): ContainerModule {
  return new ContainerModule(bind => {
    bind<AppStorage<Person>>(symbols.appStorage).toDynamicValue(
      ctx =>
        new AppStorage(
          ctx.container.get(symbols.appStorageProvider),
          ctx.container.get(coreModuleApi.symbols.logger),
          "testStorage",
          personSchema,
        ),
    );

    bind<TLibSymbolType<typeof symbols.appStorageProvider>>(symbols.appStorageProvider)
      .to(AsyncStorageProvider)
      .inSingletonScope();
  });
}
