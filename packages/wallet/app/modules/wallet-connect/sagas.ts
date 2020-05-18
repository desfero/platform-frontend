import { call, SagaGenerator, takeLatest } from "@neufund/sagas";
import { coreModuleApi, neuGetBindings } from "@neufund/shared-modules";
import { walletConnectActions } from "./actions";
import { privateSymbols } from "./lib/symbols";
import { MODULE_ID } from "./module";
import { connectEvents } from "./sagaFunctions/connectEvents";
import { connectToURI } from "./sagaFunctions/connectToURI";

export function* tryToConnectExistingSession(): SagaGenerator<void> {
  const { walletConnectManager, logger } = yield* neuGetBindings({
    walletConnectManager: privateSymbols.walletConnectManager,
    logger: coreModuleApi.symbols.logger,
  });

  try {
    const hasExistingSession = yield* call(() => walletConnectManager.hasExistingSession());

    if (hasExistingSession) {
      logger.info(`${MODULE_ID}: Existing wallet connect session found, attempting to use it...`);
      const wcAdapter = yield* call(() => walletConnectManager.useExistingSession());
      yield* call(connectEvents, wcAdapter);
    } else {
      logger.info(`${MODULE_ID}: No existing wallet connect session found, doing nothing.`);
    }
  } catch (e) {
    logger.error(`${MODULE_ID}: tryToConnectExistingSession failed`, e);
  }
}

export function* walletConnectSaga(): SagaGenerator<void> {
  yield takeLatest(walletConnectActions.connectToPeer, connectToURI);
}
