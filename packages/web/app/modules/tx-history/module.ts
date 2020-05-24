import { setupTxHistoryModule, txHistoryApi } from "@neufund/shared-modules";
import { StringableActionCreator } from "@neufund/shared-utils";

import { setupTXHistorySagas } from "./sagas";

type TModuleConfig = {
  refreshOnAction: StringableActionCreator<any, any, any> | undefined;
};

const MODULE_ID = "web:tx-history";

const setupWebTxHistoryModule = (config: TModuleConfig) => {
  const parentModules = setupTxHistoryModule(config);

  const webTxHistoryModule = {
    id: MODULE_ID,
    api: txHistoryApi,
    sagas: [setupTXHistorySagas()],
    reducerMap: parentModules[1].reducerMap,
  };

  return [...parentModules, webTxHistoryModule];
};

export { setupWebTxHistoryModule, txHistoryApi };
