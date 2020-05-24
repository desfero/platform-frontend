import { buffers, call, channel, Channel, delay, put, race, take } from "@neufund/sagas";
import { secondsToMs } from "@neufund/shared-utils";
import * as Web3 from "web3";

import { TGlobalDependencies } from "../../../di/setupBindings";
import { TPendingTxs } from "../../../lib/api/users-tx/interfaces";
import { OutOfGasError, RevertedTransactionError } from "../../../lib/web3/Web3Adapter";
import { actions } from "../../actions";
import { neuCall } from "../../sagasUtils";
import { TransactionCancelledError } from "./errors";
import { EEventEmitterChannelEvents, TEventEmitterChannelEvents } from "./types";
import { isTransactionMined } from "./utils";

enum TRANSACTION_STATUS {
  REVERTED = "0x0",
  SUCCESS = "0x1",
}

/**
 * Get information about transactions (from `web3.eth.getTransaction`) or `null` when transaction is pending
 * throws OutOfGasError or RevertedTransactionError in case of transaction not mined successfully
 */

export function* getTransactionOrThrow(
  { web3Manager, apiUserTxService }: TGlobalDependencies,
  txHash: string,
): Generator<any, any, any> {
  const tx: Web3.Transaction = yield web3Manager.getTransactionByHash(txHash);
  const txReceipt: Web3.TransactionReceipt | null = yield web3Manager.getTransactionReceipt(txHash);

  // If the proxy transactional node fails to post the transaction
  const pendingTx: TPendingTxs = yield apiUserTxService.pendingTxs();

  if (
    pendingTx &&
    pendingTx.pendingTransaction &&
    pendingTx.pendingTransaction.transaction &&
    pendingTx.pendingTransaction.transaction.status === "failed"
  ) {
    throw new TransactionCancelledError(pendingTx.pendingTransaction.transaction.failedRpcError);
  }

  const currentBlockNumber = yield web3Manager.getBlockNumber();

  const isMined = isTransactionMined(tx, txReceipt, currentBlockNumber);

  if (!isMined) {
    return null;
  }

  if (txReceipt!.status === TRANSACTION_STATUS.REVERTED) {
    if (txReceipt!.gasUsed === tx.gas) {
      // All gas is burned in this case
      throw new OutOfGasError();
    }
    throw new RevertedTransactionError();
  }

  return tx;
}

/**
 * Watch for a given `txHash` and emit events to the `txChannel`
 * @note `watchForTx` won't cancel watching on it's own.
 *       It's a responsibility of the consumer to cancel the watcher (by canceling the saga)
 */
export function* watchForTx(
  { web3Manager }: TGlobalDependencies,
  txHash: string,
  txChannel: Channel<TEventEmitterChannelEvents>,
): Generator<any, any, any> {
  // Our local ethereum node is based on POA therefore we don't have
  // a mining pool which makes tests flaky when there is not enough memory on CI
  // Introducing an artificial delay here should make the pending modal stay a little bit longer
  // so cypress can properly assert modal content
  if (process.env.NF_CYPRESS_RUN === "1") {
    yield delay(secondsToMs(3));
  }

  let lastBlockId = -1;
  while (true) {
    try {
      const currentBlockNo: number = yield web3Manager.getBlockNumber();

      if (lastBlockId !== currentBlockNo) {
        lastBlockId = currentBlockNo;

        yield put(txChannel, {
          type: EEventEmitterChannelEvents.NEW_BLOCK,
          blockId: currentBlockNo,
        });

        const tx = yield neuCall(getTransactionOrThrow, txHash);
        if (tx) {
          yield put(txChannel, { type: EEventEmitterChannelEvents.TX_MINED });
        }
      }

      yield take(actions.web3.newBlockArrived.getType());
    } catch (error) {
      if (error instanceof TransactionCancelledError) {
        yield put(txChannel, { type: EEventEmitterChannelEvents.CANCELLED, error });
      } else if (error instanceof RevertedTransactionError) {
        yield put(txChannel, { type: EEventEmitterChannelEvents.REVERTED_TRANSACTION, error });
      } else if (error instanceof OutOfGasError) {
        yield put(txChannel, { type: EEventEmitterChannelEvents.OUT_OF_GAS, error });
      } else {
        yield put(txChannel, { type: EEventEmitterChannelEvents.ERROR, error });
      }
    }
  }
}

export function* createWatchTxChannel(
  txHash: string,
  actionGeneratingSaga: (channel: Channel<TEventEmitterChannelEvents>) => Generator<any, any, any>,
): Generator<any, any, any> {
  // Be really careful here as `channel` only allows single subscriber and
  // it's really hard to catch why not all subscribers are notified
  // TODO: replace by `multicastChannel` after migration to redux-saga 1.*
  const txChannel: Channel<TEventEmitterChannelEvents> = yield channel(buffers.sliding(50));

  yield race({
    action: call(actionGeneratingSaga, txChannel),
    blockWatcher: neuCall(watchForTx, txHash, txChannel),
  });
}
