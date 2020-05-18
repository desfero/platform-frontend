import { call, delay, END, eventChannel, fork, put, take } from "@neufund/sagas";

import { LIGHT_WALLET_PRIVATE_DATA_CACHE_TIME } from "../../config/constants";
import { TGlobalDependencies } from "../../di/setupBindings";
import { EWeb3ManagerEvents } from "../../lib/web3/Web3Manager/Web3Manager";
import { actions } from "../actions";
import { neuTakeEvery } from "../sagasUtils";
import { TWalletMetadata } from "./types";

export function* autoClearWalletPrivateDataWatcher({
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  logger.info(`Clearing wallet private data in ${LIGHT_WALLET_PRIVATE_DATA_CACHE_TIME} ms`);

  yield delay(LIGHT_WALLET_PRIVATE_DATA_CACHE_TIME);

  logger.info("Clearing wallet private data now");
  yield put(actions.web3.clearWalletPrivateDataFromState()); //Better to clear the seed here as well
}

export function* loadPreviousWallet({
  walletStorage,
}: TGlobalDependencies): Generator<any, any, any> {
  const storageData = yield* call(() => walletStorage.get());

  if (storageData) {
    yield put(actions.web3.loadPreviousWallet(storageData));
  }
}

type TChannelTypes =
  | {
      type: EWeb3ManagerEvents.NEW_PERSONAL_WALLET_PLUGGED;
      payload: { isUnlocked: boolean; metaData: TWalletMetadata };
    }
  | {
      type: EWeb3ManagerEvents.PERSONAL_WALLET_UNPLUGGED;
    }
  | {
      type: EWeb3ManagerEvents.NEW_BLOCK_ARRIVED;
      payload: { blockNumber: string };
    }
  | {
      type: EWeb3ManagerEvents.ETH_BLOCK_TRACKER_ERROR;
      payload: { error: Error };
    };

export function* initWeb3ManagerEvents({ web3Manager }: TGlobalDependencies): any {
  const channel = eventChannel<TChannelTypes>(emit => {
    web3Manager.on(EWeb3ManagerEvents.NEW_PERSONAL_WALLET_PLUGGED, payload =>
      emit({ type: EWeb3ManagerEvents.NEW_PERSONAL_WALLET_PLUGGED, payload }),
    );
    web3Manager.on(EWeb3ManagerEvents.PERSONAL_WALLET_UNPLUGGED, () =>
      emit({ type: EWeb3ManagerEvents.PERSONAL_WALLET_UNPLUGGED }),
    );
    web3Manager.on(EWeb3ManagerEvents.NEW_BLOCK_ARRIVED, payload =>
      emit({ type: EWeb3ManagerEvents.NEW_BLOCK_ARRIVED, payload }),
    );
    web3Manager.on(EWeb3ManagerEvents.ETH_BLOCK_TRACKER_ERROR, payload =>
      emit({ type: EWeb3ManagerEvents.ETH_BLOCK_TRACKER_ERROR, payload }),
    );

    return () => {
      web3Manager.removeAllListeners();
    };
  });

  while (true) {
    const event: TChannelTypes | END = yield take(channel);
    switch (event.type) {
      case EWeb3ManagerEvents.NEW_PERSONAL_WALLET_PLUGGED:
        yield put(
          actions.web3.newPersonalWalletPlugged(event.payload.metaData, event.payload.isUnlocked),
        );
        break;
      case EWeb3ManagerEvents.NEW_BLOCK_ARRIVED:
        yield put(actions.web3.newBlockArrived(event.payload.blockNumber));
        break;
      case EWeb3ManagerEvents.ETH_BLOCK_TRACKER_ERROR:
        yield put(actions.web3.ethBlockTrackerError(event.payload.error));
        break;
    }
  }
}

export const web3Sagas = function*(): Generator<any, any, any> {
  yield fork(neuTakeEvery, ["NEW_PERSONAL_WALLET_PLUGGED"], autoClearWalletPrivateDataWatcher);
};
