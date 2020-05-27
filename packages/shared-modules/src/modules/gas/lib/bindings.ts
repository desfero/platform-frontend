import { ContainerModule } from "inversify";

import { TLibSymbolType } from "../../../types";
import { GasApi } from "./http/gas-api/GasApi";
import { symbols } from "./symbols";

const setupContainerModule = () =>
  new ContainerModule(bind => {
    bind<TLibSymbolType<typeof symbols.gasApi>>(symbols.gasApi)
      .to(GasApi)
      .inSingletonScope();
  });

export { setupContainerModule };
