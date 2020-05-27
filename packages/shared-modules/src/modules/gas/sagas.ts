import { call, fork, neuTakeEvery, put, SagaGenerator } from "@neufund/sagas";

import { neuGetBindings } from "../../utils";
import { coreModuleApi } from "../core/module";
import { gasActions } from "./actions";
import { symbols } from "./lib/symbols";

function* ensureGasApiDataSaga(): SagaGenerator<void> {
  const { logger, gasApi } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
    gasApi: symbols.gasApi,
  });

  try {
    const gasValue = yield* call(() => gasApi.getGas());
    yield put(gasActions.gasApiLoaded({ data: gasValue.body }));
  } catch (e) {
    logger.error("Error while loading GAS api data.", e);
    yield put(gasActions.gasApiLoaded({ error: e }));
  }
}

export function setupGasApiSagas(): () => SagaGenerator<void> {
  return function* gasApiSagas(): SagaGenerator<void> {
    yield fork(neuTakeEvery, gasActions.gasApiEnsureLoading, ensureGasApiDataSaga);
  };
}
