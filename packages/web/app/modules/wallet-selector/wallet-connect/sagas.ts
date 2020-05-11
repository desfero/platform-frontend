import { call, END, eventChannel, fork, neuTakeLatest, put, select, take } from "@neufund/sagas";

import { WalletConnectErrorMessage } from "../../../components/translatedMessages/messages";
import { createMessage } from "../../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../../di/setupBindings";
import {
  EWalletConnectEventTypes,
  TWalletConnectEvents,
  WalletConnectConnector,
} from "../../../lib/web3/wallet-connect/WalletConnectConnector";
import {
  WalletConnectChainIdError,
  WalletConnectSessionRejectedError,
} from "../../../lib/web3/wallet-connect/WalletConnectWallet";
import { actions, TActionFromCreator } from "../../actions";
import { EAuthStatus } from "../../auth/reducer";
import { selectAuthStatus } from "../../auth/selectors";
import { ELogoutReason } from "../../auth/types";
import { handleLogOutUserInternal } from "../../auth/user/sagas";
import { neuCall, neuTakeEvery, neuTakeLatestUntil } from "../../sagasUtils";
import { walletSelectorConnect } from "../sagas";

function* startWalletConnectEventChannel(
  { logger }: TGlobalDependencies,
  { payload }: TActionFromCreator<typeof actions.walletSelector.walletConnectStartEventListeners>,
): Generator<any, void, any> {
  while (true) {
    const event: TWalletConnectEvents | END = yield take(payload.channel);
    logger.info(`-->event received: ${event.type}`);
    switch (event.type) {
      case EWalletConnectEventTypes.SESSION_REQUEST:
        yield put(actions.walletSelector.walletConnectSessionRequest(event.payload.uri));
        break;
      case EWalletConnectEventTypes.SESSION_REQUEST_TIMEOUT:
        yield put(actions.walletSelector.walletConnectSessionRequestTimeout());
        break;
      case EWalletConnectEventTypes.CONNECT:
        yield put(actions.walletSelector.walletConnectReady());
        break;
      case EWalletConnectEventTypes.REJECT:
        yield put(actions.walletSelector.walletConnectRejected());
        break;
      case EWalletConnectEventTypes.DISCONNECT:
        yield put(actions.walletSelector.walletConnectDisconnected());
        break;
      case EWalletConnectEventTypes.ERROR:
        yield put(
          actions.walletSelector.walletConnectError(
            createMessage(WalletConnectErrorMessage.WC_GENERIC_ERROR, event.payload.error),
          ),
        );
        break;
    }
  }
}

export function* walletConnectInit({
  walletConnectConnector,
}: TGlobalDependencies): Generator<any, WalletConnectConnector, any> {
  const channel = eventChannel<TWalletConnectEvents>(emit => {
    walletConnectConnector.on(EWalletConnectEventTypes.SESSION_REQUEST, uri =>
      emit({ type: EWalletConnectEventTypes.SESSION_REQUEST, payload: { uri } }),
    );
    walletConnectConnector.on(EWalletConnectEventTypes.CONNECT, () =>
      emit({ type: EWalletConnectEventTypes.CONNECT }),
    );
    walletConnectConnector.on(EWalletConnectEventTypes.SESSION_REQUEST_TIMEOUT, () =>
      emit({ type: EWalletConnectEventTypes.SESSION_REQUEST_TIMEOUT }),
    );
    walletConnectConnector.on(EWalletConnectEventTypes.DISCONNECT, () =>
      emit({ type: EWalletConnectEventTypes.DISCONNECT }),
    );
    walletConnectConnector.on(EWalletConnectEventTypes.REJECT, () =>
      emit({ type: EWalletConnectEventTypes.REJECT }),
    );
    walletConnectConnector.on(EWalletConnectEventTypes.ERROR, error =>
      emit({ type: EWalletConnectEventTypes.ERROR, payload: { error } }),
    );

    return () => {
      walletConnectConnector.removeAllListeners();
    };
  });
  yield put(actions.walletSelector.walletConnectStartEventListeners(channel));
  return walletConnectConnector;
}

//todo move to utils
export const mapWalletConnectErrorsToMessages = (error: Error) => {
  if (error instanceof WalletConnectSessionRejectedError) {
    return createMessage(WalletConnectErrorMessage.WC_SESSION_REJECTED_ERROR);
  } else if (error instanceof WalletConnectChainIdError) {
    return createMessage(WalletConnectErrorMessage.WC_SESSION_INVALID_CHAIN_ID);
  } else {
    return createMessage(WalletConnectErrorMessage.WC_GENERIC_ERROR);
  }
};

export function* walletConnectStart({
  web3Manager,
  walletConnectConnector,
  logger,
}: TGlobalDependencies): Generator<any, void, any> {
  try {
    yield neuCall(walletConnectInit);
    const wc = yield walletConnectConnector.connect();
    yield web3Manager.plugPersonalWallet(wc);
    yield* call(walletSelectorConnect, undefined, undefined);
  } catch (e) {
    const message = mapWalletConnectErrorsToMessages(e);
    yield put(actions.walletSelector.walletConnectError(message));
    logger.error(`walletConnectStart error: ${e}`);
  }
}

export function* walletConnectStop({
  walletConnectConnector,
  logger,
}: TGlobalDependencies): Generator<any, void, any> {
  try {
    yield walletConnectConnector.cancelSession();
  } catch (e) {
    logger.error(`walletConnectStop error: ${e}`);
  }
}

export function* logutOnWalletDisconnect(_: TGlobalDependencies): Generator<any, void, any> {
  const authStatus = yield* select(selectAuthStatus);
  if (authStatus === EAuthStatus.AUTHORIZED) {
    yield neuCall(handleLogOutUserInternal, ELogoutReason.WC_PEER_DISCONNECTED);
  }
}

export function* walletConnectSagas(): Generator<any, void, any> {
  yield fork(neuTakeEvery, actions.walletSelector.walletConnectStart, walletConnectStart);
  yield fork(neuTakeLatest, actions.walletSelector.walletConnectInit, walletConnectInit);
  yield fork(neuTakeEvery, actions.walletSelector.walletConnectStop, walletConnectStop);
  yield fork(
    neuTakeEvery,
    actions.walletSelector.walletConnectSessionRequestTimeout,
    walletConnectStop,
  );
  yield fork(
    neuTakeEvery,
    actions.walletSelector.walletConnectDisconnected,
    logutOnWalletDisconnect,
  );
  yield fork(
    neuTakeLatestUntil,
    actions.walletSelector.walletConnectStartEventListeners,
    actions.auth.reset,
    startWalletConnectEventChannel,
  );
}
