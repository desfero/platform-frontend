import { generateSharedModuleId } from "../../utils";
import { gasActions } from "./actions";
import { setupContainerModule } from "./lib/bindings";
import { gasReducerMap, IGasState } from "./reducer";
import * as sagas from "./sagas";
import * as selectors from "./selectors";

const MODULE_ID = generateSharedModuleId("gas");

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
};

export { setupGasModule, gasApi, IGasState };
