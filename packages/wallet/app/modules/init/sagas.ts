import { neuTakeLatest, put, fork, call, SagaGenerator } from "@neufund/sagas";
import { coreModuleApi, neuGetBindings, tokenPriceModuleApi } from "@neufund/shared-modules";

import { authActions } from "../auth/actions";
import { authModuleAPI } from "../auth/module";
import { walletContractsModuleApi } from "../contracts/module";
import { notificationModuleApi } from "../notifications/module";
import { walletConnectModuleApi } from "../wallet-connect/module";
import { initActions } from "./actions";

/**
 * Init global watchers
 */
function* initGlobalWatchers(): SagaGenerator<void> {
  yield put(tokenPriceModuleApi.actions.watchTokenPriceStart());
}

function* initStartSaga(): SagaGenerator<void> {
  const { logger, notifications } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
    notifications: notificationModuleApi.symbols.notifications,
  });
  try {
    yield* call(walletContractsModuleApi.sagas.initializeContracts);
    yield* call(initGlobalWatchers);

    // checks if we have credentials and automatically signs the user
    yield* call(authModuleAPI.sagas.trySignInExistingAccount);

    yield put(initActions.done());

    // TODO: Move push notification from initStartSaga
    //       as it won't work given until `done` is dispatched there is a splash screen
    //       and it's not possible to accept permissions request

    // init push notifications
    yield* call(() => notifications.init());

    // subscribe for notifications test
    yield* call(() =>
      notifications.onReceivedNotificationInForeground(
        notification => {
          logger.info("------event work--------", notification);
        },
        { alert: true, sound: true, badge: false },
      ),
    );
  } catch (e) {
    yield put(initActions.error(e?.message ?? "Unknown error"));

    logger.error("App init error", e);
  }
}

function* initAuthSigned(): SagaGenerator<void> {
  yield* call(walletConnectModuleApi.sagas.tryToConnectExistingSession);
}

export function* initSaga(): SagaGenerator<void> {
  yield fork(neuTakeLatest, initActions.start, initStartSaga);
  yield fork(neuTakeLatest, authActions.signed, initAuthSigned);
}
