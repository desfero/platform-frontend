import { END, eventChannel, fork, neuTakeLatest, neuTakeLatestUntil, put, take } from "@neufund/sagas";

import { WalletConnectErrorMessage } from "../../../components/translatedMessages/messages";
import { createMessage } from "../../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../../di/setupBindings";
import {
  EWalletConnectEventTypes,
  TWalletConnectEvents
} from "../../../lib/web3/wallet-connect/WalletConnectConnector";
import { WalletConnectSessionRejectedError } from "../../../lib/web3/wallet-connect/WalletConnectWallet";
import { actions, TActionFromCreator } from "../../actions";
import { handleLogOutUserInternal } from "../../auth/user/sagas";
import { neuCall, neuTakeEvery } from "../../sagasUtils";
import { walletSelectorConnect } from "../sagas";

function* startWalletConnectEventChannel(
  _: TGlobalDependencies,
  {payload}:TActionFromCreator<typeof actions.walletSelector.walletConnectStartEventListeners>
):Generator<any, void, any> {
  while (true) {
    const event: TWalletConnectEvents | END = yield take(payload.channel);
    console.log("-->event received: ", event.type)
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
        yield put(actions.walletSelector.walletConnectError(
          createMessage(WalletConnectErrorMessage.WC_GENERIC_ERROR,
            event.payload.error
          )
        ));
        break;
    }
  }
}

export function* walletConnectInit(
  { walletConnectConnector }: TGlobalDependencies
): Generator<any, any, any> {
  const channel = eventChannel<TWalletConnectEvents>(emit => {
    walletConnectConnector.on(EWalletConnectEventTypes.SESSION_REQUEST, uri =>
      emit({ type: EWalletConnectEventTypes.SESSION_REQUEST, payload: { uri } }));
    walletConnectConnector.on(EWalletConnectEventTypes.CONNECT, () =>
      emit({ type: EWalletConnectEventTypes.CONNECT }));
    walletConnectConnector.on(EWalletConnectEventTypes.SESSION_REQUEST_TIMEOUT, () =>
      emit({ type: EWalletConnectEventTypes.SESSION_REQUEST_TIMEOUT }));
    walletConnectConnector.on(EWalletConnectEventTypes.DISCONNECT, () =>
      emit({ type: EWalletConnectEventTypes.DISCONNECT }));
    walletConnectConnector.on(EWalletConnectEventTypes.REJECT, () =>
      emit({ type: EWalletConnectEventTypes.REJECT }));
    walletConnectConnector.on(EWalletConnectEventTypes.ERROR, error =>
      emit({ type: EWalletConnectEventTypes.ERROR, payload: { error } }));

    return () => {
      walletConnectConnector.removeAllListeners()
    }
  });
  yield put(actions.walletSelector.walletConnectStartEventListeners(channel));
  return yield walletConnectConnector.connect();
}

//todo move to utils
export const mapWalletConnectErrorsToMessages = (error: Error) => {
  if (error instanceof WalletConnectSessionRejectedError) {
    return createMessage(WalletConnectErrorMessage.WC_SESSION_REJECTED_ERROR)
  } else {
    return createMessage(WalletConnectErrorMessage.WC_GENERIC_ERROR)
  }
};

export function* walletConnectStart(
  { web3Manager }: TGlobalDependencies
): Generator<any, void, any> {
  try {
    const wc = yield neuCall(walletConnectInit);
    yield web3Manager.plugPersonalWallet(wc);
    yield* neuCall(walletSelectorConnect)
  } catch (e) {
    const message = mapWalletConnectErrorsToMessages(e);
    yield put(actions.walletSelector.walletConnectError(message));
    console.log("walletConnectStart error:",e);
  }
}

export function* walletConnectStop(
  { walletConnectConnector }: TGlobalDependencies
): Generator<any, void, any> {
  try {
    const result = yield walletConnectConnector.disconnect();
    console.log(result)
  } catch (e) {
    console.log("walletConnectStop error:", e)
  }
}

export function* walletConnectCancelSession(
  { walletConnectConnector }: TGlobalDependencies
): Generator<any, void, any> {
  try {
    const result = yield walletConnectConnector.cancelSession();
    console.log(result)
  } catch (e) {
    console.log("walletConnectStop error:", e)
  }
}

export function* walletConnectSagas(): Generator<any, void, any> {
  yield fork(neuTakeEvery, actions.walletSelector.walletConnectStart, walletConnectStart);//todo stop on route change
  yield fork(neuTakeLatest, actions.walletSelector.walletConnectRestoreConnection, walletConnectInit);
  yield fork(neuTakeEvery, actions.walletSelector.walletConnectStop, walletConnectStop);
  yield fork(neuTakeEvery, actions.walletSelector.walletConnectSessionRequestTimeout, walletConnectCancelSession);
  yield fork(neuTakeEvery, actions.walletSelector.walletConnectDisconnected, handleLogOutUserInternal );//fixme add reason
  yield fork(neuTakeLatestUntil, actions.walletSelector.walletConnectStartEventListeners, actions.auth.reset, startWalletConnectEventChannel);
}
