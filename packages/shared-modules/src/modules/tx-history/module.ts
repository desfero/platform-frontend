import { ContainerModule } from "inversify";

import { TLibSymbolType, TModuleState } from "../../types";
import { generateSharedModuleId } from "../../utils";
import { setupTokenPriceModule } from "../token-price/module";
import { txHistoryActions } from "./actions";
import { AnalyticsApi } from "./lib/http/analytics-api/AnalyticsApi";
import { txHistoryReducerMap } from "./reducer";
import { setupTXHistorySagas } from "./sagas";
import * as selectors from "./selectors";
import { symbols } from "./symbols";

export {
  ETransactionDirection,
  ETransactionType,
  ETransactionStatus,
  ETransactionSubType,
  TExtractTxHistoryFromType,
  TTxHistory,
} from "./types";

export { ETxHistoryMessage } from "./messages";

const MODULE_ID = generateSharedModuleId("tx-history");

type Config = Parameters<typeof setupTXHistorySagas>[0];

const setupContainerModule = () =>
  new ContainerModule(bind => {
    bind<TLibSymbolType<typeof symbols.analyticsApi>>(symbols.analyticsApi)
      .to(AnalyticsApi)
      .inSingletonScope();
  });

const setupTxHistoryModule = (config: Config) => {
  const module = {
    id: MODULE_ID,
    api: txHistoryApi,
    libs: [setupContainerModule()],
    sagas: [setupTXHistorySagas(config)],
    reducerMap: txHistoryReducerMap,
  };

  return [setupTokenPriceModule({ refreshOnAction: undefined }), module];
};

const txHistoryApi = {
  actions: txHistoryActions,
  selectors,
};

export { setupTxHistoryModule, txHistoryApi };

export type TTXHistoryModuleState = TModuleState<typeof setupTxHistoryModule>;
