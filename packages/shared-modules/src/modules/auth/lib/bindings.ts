import { ContainerModule } from "inversify";

import { TLibSymbol, TLibSymbolType } from "../../../types";
import { IEthManager, IHttpClient, ISingleKeyStorage } from "../../core/module";
import { AuthModuleError } from "../errors";
import { AuthBinaryHttpClient } from "./http/AuthBinaryHttpClient";
import { AuthJsonHttpClient } from "./http/AuthJsonHttpClient";
import { SignatureAuthApi } from "./signature/SignatureAuthApi";
import { symbols } from "./symbols";
import { UsersApi } from "./users/UsersApi";

type TSetupContainerConfig = {
  jwtStorageSymbol: TLibSymbol<ISingleKeyStorage<string>>;
  ethManagerSymbol: TLibSymbol<IEthManager>;
};

class JWTStorageNotProvidedError extends AuthModuleError {
  constructor() {
    super(`No jwt storage found. Make sure symbol is bound or it extends a proper base class`);
  }
}

class EthManagerNotProvidedError extends AuthModuleError {
  constructor() {
    super(`No eth manager found. Make sure symbol is bound or it extends a proper base class`);
  }
}

export function setupContainerModule(config: TSetupContainerConfig): ContainerModule {
  return new ContainerModule(bind => {
    bind<TLibSymbolType<typeof symbols.signatureAuthApi>>(symbols.signatureAuthApi)
      .to(SignatureAuthApi)
      .inSingletonScope();

    bind<IHttpClient>(symbols.authJsonHttpClient)
      .to(AuthJsonHttpClient)
      .inSingletonScope();

    bind<IHttpClient>(symbols.authBinaryHttpClient)
      .to(AuthBinaryHttpClient)
      .inSingletonScope();

    bind<UsersApi>(symbols.apiUserService)
      .to(UsersApi)
      .inSingletonScope();

    bind<TLibSymbolType<typeof symbols.jwtStorage>>(symbols.jwtStorage).toDynamicValue(ctx => {
      const symbol = config.jwtStorageSymbol;

      if (!ctx.container.isBound(symbol)) {
        throw new JWTStorageNotProvidedError();
      }

      return ctx.container.get(symbol);
    });

    bind<TLibSymbolType<typeof symbols.ethManager>>(symbols.ethManager).toDynamicValue(ctx => {
      const symbol = config.ethManagerSymbol;

      if (!ctx.container.isBound(symbol)) {
        throw new EthManagerNotProvidedError();
      }

      return ctx.container.get(symbol);
    });
  });
}
