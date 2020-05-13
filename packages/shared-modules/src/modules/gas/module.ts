import { ContainerModule } from "inversify";

import { TLibSymbolType, TModuleState } from "../../types";
import { generateSharedModuleId } from "../../utils";
import { gasActions } from "./actions";
import { GasApi } from "./lib/http/gas-api/GasApi";
import { gasReducerMap } from "./reducer";
import * as sagas from "./sagas";
import * as selectors from "./selectors";
import { symbols } from "./symbols";
export { IGasState } from "./reducer";

const MODULE_ID = generateSharedModuleId("gas");

const setupContainerModule = () =>
  new ContainerModule(bind => {
    bind<TLibSymbolType<typeof symbols.gasApi>>(symbols.gasApi)
      .to(GasApi)
      .inSingletonScope();
  });

const setupGasModule = () => {
  const module = {
    id: MODULE_ID,
    api: gasApi,
    libs: [setupContainerModule()],
    sagas: [sagas.setupGasApiSagas()],
    reducerMap: gasReducerMap,
  };

  return module;
};

const gasApi = {
  actions: gasActions,
  selectors,
  sagas,
};

export { setupGasModule, gasApi };

export type TGasModuleState = TModuleState<typeof setupGasModule>;
