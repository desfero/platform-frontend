import { fork, neuTakeEvery, put, SagaGenerator } from "@neufund/sagas";

import { neuGetBindings } from "../../utils";
import { IHttpResponse } from "../core/lib/client/IHttpClient";
import { coreModuleApi } from "../core/module";
import { gasActions } from "./actions";
import { GasModelShape } from "./lib/http/gas-api/GasApi";
import { symbols } from "./symbols";

type TGlobalDependencies = unknown;

function* ensureGasApiDataSaga(_: TGlobalDependencies): Generator<any, any, any> {
  const { logger, gasApi } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
    gasApi: symbols.gasApi,
  });

  try {
    const gasValue: IHttpResponse<GasModelShape> = yield gasApi.getGas();
    yield put(gasActions.gasApiLoaded({ data: gasValue.body }));
  } catch (e) {
    logger.error("Error while loading GAS api data.", e);
    yield put(gasActions.gasApiLoaded({ error: e }));
  }
}

export function setupGasApiSagas(): () => SagaGenerator<void> {
  return function* gasApiSagas(): any {
    yield fork(neuTakeEvery, gasActions.gasApiEnsureLoading, ensureGasApiDataSaga);
  };
}
