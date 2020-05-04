import { TModuleState } from "../../types";
import { generateSharedModuleId } from "../../utils";
import { setupTokenPriceModule } from "../token-price/module";
import { txHistoryActions } from "./actions";
import { txHistoryReducerMap } from "./reducer";
import { setupTXHistorySagas } from "./sagas";
import * as selectors from "./selectors";

export { ETxHistoryMessage } from "./messages";

const MODULE_ID = generateSharedModuleId("tx-history");

type Config = Parameters<typeof setupTXHistorySagas>[0];

const setupTXHistoryModule = (config: Config) => {
  const module = {
    id: MODULE_ID,
    api: txHistoryApi,
    sagas: [setupTXHistorySagas(config)],
    reducerMap: txHistoryReducerMap,
  };

  return [setupTokenPriceModule({ refreshOnAction: undefined }), module];
};

const txHistoryApi = {
  actions: txHistoryActions,
  selectors,
};

export { setupTXHistoryModule, txHistoryApi };

export type TTXHistoryModuleState = TModuleState<typeof setupTXHistoryModule>;
