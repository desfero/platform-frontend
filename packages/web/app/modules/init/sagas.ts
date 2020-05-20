import { call, fork, put, SagaGenerator, select } from "@neufund/sagas";
import { authModuleAPI, EWalletType, tokenPriceModuleApi } from "@neufund/shared-modules";
import { isJwtExpiringLateEnough } from "@neufund/shared-utils";

import { TGlobalDependencies } from "../../di/setupBindings";
import { TAppGlobalState } from "../../store";
import { ensureWalletConnection } from "../access-wallet/sagas";
import { actions, TActionFromCreator } from "../actions";
import { loadUser } from "../auth/user/external/sagas";
import { initializeContracts } from "../contracts/sagas";
import { neuCall, neuTakeEvery, neuTakeOnly } from "../sagasUtils";
import { detectUserAgent } from "../user-agent/sagas";
import { initWeb3ManagerEvents } from "../web3/sagas";
import { selectWalletType } from "../web3/selectors";
import { WalletMetadataNotFoundError } from "./errors";
import { EInitType } from "./reducer";
import { selectIsAppReady, selectIsSmartContractInitDone } from "./selectors";

/**
 * Starts watching for token prices
 */
function* startGlobalWatchers(): SagaGenerator<void> {
  yield put(tokenPriceModuleApi.actions.watchTokenPriceStart());
}

export function* stopGlobalWatchers(): SagaGenerator<void> {
  yield put(tokenPriceModuleApi.actions.watchTokenPriceStop());
  yield put(actions.auth.stopProfileMonitor());
  yield put(actions.auth.stopUserActivityWatcher());
  yield put(actions.auth.stopTimeoutWatcher());
  yield put(authModuleAPI.actions.stopJwtExpirationWatcher());
  yield put(actions.txMonitor.stopTxMonitor());
  yield put(actions.wallet.stopWalletBalanceWatcher());
}

function* initSmartcontracts({
  web3Manager,
  logger,
}: TGlobalDependencies): Generator<any, void, any> {
  try {
    yield fork(neuCall, initWeb3ManagerEvents);
    yield web3Manager.initialize();

    yield neuCall(initializeContracts);

    yield put(actions.init.done(EInitType.SMART_CONTRACTS_INIT));
  } catch (e) {
    yield put(
      actions.init.error(
        EInitType.SMART_CONTRACTS_INIT,
        "Error while connecting with Ethereum blockchain",
      ),
    );
    logger.error("Smart Contract Init Error", e);
  }
}

function* makeSureWalletMetaDataExists({
  walletStorage,
}: TGlobalDependencies): Generator<any, void, any> {
  const metadata = yield* call(() => walletStorage.get());
  if (metadata === undefined) {
    throw new WalletMetadataNotFoundError();
  }
}

function* deleteWalletConnectSession({
  walletConnectStorage,
}: TGlobalDependencies): Generator<any, void, any> {
  return yield walletConnectStorage.clear();
}

function* restoreUserSession(
  { logger }: TGlobalDependencies,
  jwt: string,
): Generator<any, void, any> {
  yield neuCall(makeSureWalletMetaDataExists);
  if (isJwtExpiringLateEnough(jwt)) {
    try {
      yield neuCall(authModuleAPI.sagas.setJwt, jwt);
      yield neuCall(loadUser);
      // plugin wallet connect
      const walletType = yield select(selectWalletType);
      if (walletType === EWalletType.WALLETCONNECT) {
        yield neuCall(ensureWalletConnection);
      }
      yield put(actions.auth.finishSigning());
    } catch (e) {
      yield put(actions.auth.logout());
      logger.error(`Cannot retrieve account. ${e}`);
    }
  } else {
    yield put(actions.auth.logout());
    logger.info("JTW expiring too soon.");
  }
}

export function* startServices(_: TGlobalDependencies): Generator<any, void, any> {
  yield put(actions.init.startServices());
  yield waitUntilSmartContractsAreInitialized();
  yield neuCall(startGlobalWatchers);
}

export function* restartServices(_: TGlobalDependencies): Generator<any, void, any> {
  yield put(actions.init.restartServices());
  yield neuCall(startGlobalWatchers);
}

export function* stopServices(_: TGlobalDependencies): Generator<any, void, any> {
  yield put(actions.init.stopServices());
  yield neuCall(stopGlobalWatchers);
}

export function* initApp({ logger }: TGlobalDependencies): Generator<any, void, any> {
  try {
    yield neuCall(startServices);
    yield neuCall(detectUserAgent);
    const jwt = yield neuCall(authModuleAPI.sagas.loadJwt);

    if (jwt) {
      yield neuCall(restoreUserSession, jwt);
    } else {
      yield neuCall(deleteWalletConnectSession);
    }
    yield put(actions.init.done(EInitType.APP_INIT));
  } catch (e) {
    if (e instanceof WalletMetadataNotFoundError) {
      logger.error("User has JWT but no Wallet Metadata", e);
      yield put(actions.auth.logout());
    } else {
      yield put(actions.init.error(EInitType.APP_INIT, e.message || "Unknown error"));
      logger.error("App init error", e);
    }
  }
}

export function* initStartSaga(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.init.start>,
): Generator<any, void, any> {
  const { initType } = action.payload;

  switch (initType) {
    case EInitType.APP_INIT:
      return yield neuCall(initApp);
    case EInitType.SMART_CONTRACTS_INIT:
      return yield neuCall(initSmartcontracts);
    default:
      throw new Error("Unrecognized init type!");
  }
}

export function* checkIfSmartcontractsInitNeeded(): Generator<any, boolean, any> {
  const isDoneOrInProgress: boolean = yield select(
    (s: TAppGlobalState) => s.init.smartcontractsInit.done || s.init.smartcontractsInit.inProgress,
  );

  return !isDoneOrInProgress;
}

export function* initSmartcontractsOnce(): Generator<any, void, any> {
  const isNeeded = yield checkIfSmartcontractsInitNeeded();
  if (!isNeeded) {
    return;
  }

  yield put(actions.init.start(EInitType.SMART_CONTRACTS_INIT));
}

export function* waitUntilSmartContractsAreInitialized(): Generator<any, any, any> {
  const isSmartContractsInitialized = yield select(selectIsSmartContractInitDone);

  if (!isSmartContractsInitialized) {
    yield neuTakeOnly(actions.init.done, { initType: EInitType.SMART_CONTRACTS_INIT as any });
  }
  return;
}

export function* waitForAppInit(): Generator<any, any, any> {
  let appIsReady: boolean = yield select(selectIsAppReady);

  if (!appIsReady) {
    yield neuTakeOnly(actions.init.done, { initType: EInitType.APP_INIT as any });
    appIsReady = true;
  }
  return appIsReady;
}

export const initSagas = function*(): Generator<any, void, any> {
  yield fork(neuTakeEvery, "INIT_START", initStartSaga);
  // Smart Contracts are only initialized once during the whole life cycle of the app
  yield fork(initSmartcontractsOnce);
};
