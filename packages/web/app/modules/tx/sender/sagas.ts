import { call, Channel, put, race, select, take, takeLatest } from "@neufund/sagas";

import { TGlobalDependencies } from "../../../di/setupBindings";
import {
  TPendingTxs,
  TxPendingExternal,
  TxPendingWithMetadata,
} from "../../../lib/api/users/interfaces";
import { BrowserWalletError } from "../../../lib/web3/browser-wallet/BrowserWallet";
import { LedgerError } from "../../../lib/web3/ledger-wallet/errors";
import { LightError } from "../../../lib/web3/light-wallet/LightWallet";
import {
  InvalidChangeIdError,
  InvalidRlpDataError,
  LongTransactionQueError,
  LowNonceError,
  OutOfGasError,
  UnknownEthNodeError,
} from "../../../lib/web3/Web3Adapter";
import { SignerError } from "../../../lib/web3/Web3Manager/Web3Manager";
import { TAppGlobalState } from "../../../store";
import { connectWallet } from "../../access-wallet/sagas";
import { actions } from "../../actions";
import { IGasState } from "../../gas/reducer";
import { selectGasPrice } from "../../gas/selectors";
import { neuCall, neuRepeatIf, neuSpawn } from "../../sagasUtils";
import { selectWalletType } from "../../web3/selectors";
import { EWalletType } from "../../web3/types";
import { createWatchTxChannel } from "../event-channel/sagas";
import { EEventEmitterChannelEvents, TEventEmitterChannelEvents } from "../event-channel/types";
import {
  createTxMetadata,
  deletePendingTransaction,
  markTransactionAsPending,
  updatePendingTxs,
} from "../monitor/sagas";
import {
  selectAreTherePendingTxs,
  selectAreTherePlatformPendingTxs,
  selectExternalPendingTransaction,
} from "../monitor/selectors";
import { ETxType, TAdditionalDataByType } from "../types";
import { validateGas } from "../validator/sagas";
import { ETransactionErrorType, ETxSenderState } from "./reducer";
import { selectTxAdditionalData, selectTxDetails, selectTxType } from "./selectors";
import { getTxSenderErrorType } from "./utils";

export interface ITxSendParams {
  type: ETxType;
  transactionFlowGenerator: any;
  extraParam?: any;
  // Design extraParam to be a tuple that handles any number of params
  // @see neuCall
}

export function* txMonitorSaga(): any {
  const txMonitorEffect = neuCall(txMonitor);

  yield call(txControllerSaga, txMonitorEffect);
}

function* txMonitor(_: TGlobalDependencies): Generator<any, any, any> {
  const txs: TPendingTxs = yield select((s: TAppGlobalState) => s.txMonitor.txs);

  if (txs.pendingTransaction) {
    const pendingTransaction = txs.pendingTransaction as TxPendingWithMetadata;

    const txHash = pendingTransaction.transaction.hash;

    yield put(
      actions.txSender.txSenderShowModal({
        additionalData: pendingTransaction.transactionAdditionalData,
        error: pendingTransaction.transactionError,
        state: pendingTransaction.transactionStatus,
        txDetails: pendingTransaction.transaction,
        txHash: txHash,
        txTimestamp: pendingTransaction.transactionTimestamp,
        type: pendingTransaction.transactionType,
      }),
    );

    // only watch for transaction status when not yet mined
    if (pendingTransaction.transactionStatus === ETxSenderState.MINING) {
      yield neuCall(watchTxSubSaga, txHash);
    }
  }
}

function* txControllerSaga(controlledEffect: Generator<any, any, any>): any {
  const gasPrice: IGasState = yield select(selectGasPrice);

  if (!gasPrice) {
    yield take(actions.gas.gasApiLoaded);
  }

  const { cancel } = yield race({
    result: controlledEffect,
    cancel: take("TX_SENDER_HIDE_MODAL"),
  });

  if (cancel) {
    throw new Error("TX_SENDING_CANCELLED");
  }

  // wait for user to close modal
  yield take("TX_SENDER_HIDE_MODAL");

  // when modal was closed delete transaction for pending list
  yield neuCall(deletePendingTransaction);

  yield put(actions.wallet.loadWalletData());
}

export function* txSendSaga({ type, transactionFlowGenerator, extraParam }: ITxSendParams): any {
  yield neuCall(ensureNoPendingTx);
  const sendProcessEffect = neuCall(txSendProcess, type, transactionFlowGenerator, extraParam);

  yield call(txControllerSaga, sendProcessEffect);
}

function* txSendProcess(
  { logger }: TGlobalDependencies,
  transactionType: ETxType,
  transactionFlowGenerator: any,
  extraParam?: any,
): any {
  try {
    const walletType = yield* select((state: TAppGlobalState) => selectWalletType(state));
    yield put(actions.txSender.txSenderShowModal({ type: transactionType }));

    yield neuRepeatIf("TX_SENDER_CHANGE", "TX_SENDER_ACCEPT", transactionFlowGenerator, extraParam);

    const txData = yield select(selectTxDetails);
    // Check if gas amount is correct
    yield neuCall(validateGas, txData);

    // accept transaction on wallet
    yield call(connectWallet);

    // TODO: Use is wallet unlocked from WalletMeta instead of asserting the wallet type directly
    if (walletType === EWalletType.LIGHT) {
      yield put(actions.txSender.txSenderLoading());
    } else {
      yield put(actions.txSender.txSenderWalletSigning());
    }

    // send transaction
    const txHash = yield neuCall(sendTxSubSaga);

    yield neuCall(watchTxSubSaga, txHash);
  } catch (error) {
    const errorType = getTxSenderErrorType(error);

    logger.error(`Error while processing transaction`, error, { errorType, transactionType });

    yield put(actions.txSender.txSenderError(errorType));
  }
}

/**
 * Check for pending transactions, behaves differently depending on the tx type
 * 1. For pending platform tx it will stop current tx (by throwing error) and start monitoring pending transaction
 * 2. For external pending tx wait for it to finish and then continue with current tx
 */
function* ensureNoPendingTx({ logger }: TGlobalDependencies): any {
  while (true) {
    yield neuCall(updatePendingTxs);

    const areTherePendingTxs: boolean = yield select(selectAreTherePendingTxs);
    if (!areTherePendingTxs) {
      return;
    }

    const areTherePlatformPendingTransactions: boolean = yield select(
      selectAreTherePlatformPendingTxs,
    );
    if (areTherePlatformPendingTransactions) {
      // create new detached process
      yield neuSpawn(txMonitorSaga);

      // cancel current one
      throw new Error("There is already a pending transaction on the platform");
    }

    const externalPendingTransaction: TxPendingExternal | undefined = yield select(
      selectExternalPendingTransaction,
    );
    if (externalPendingTransaction) {
      // go to miner
      const txHash = externalPendingTransaction.transaction.hash;
      yield put(actions.txSender.txSenderWatchPendingTxs(txHash));
      logger.info(`Waiting for out of bound transactions: ${txHash}`);
      yield neuCall(watchPendingOOOTxSubSaga, txHash);
    }
  }
}

function* sendTxSubSaga({ web3Manager }: TGlobalDependencies): any {
  const type: ReturnType<typeof selectTxType> = yield select(selectTxType);
  const txData: ReturnType<typeof selectTxDetails> = yield select(selectTxDetails);

  if (!txData || !type) {
    throw new Error("Tx data is not defined");
  }

  const txAdditionalData: TAdditionalDataByType<typeof type> = yield select(
    (state: TAppGlobalState) => selectTxAdditionalData<typeof type>(state),
  );
  const txMetadata = createTxMetadata(type, txAdditionalData);

  try {
    const txHash: string = yield web3Manager.sendTransaction(txData, txMetadata);

    const txTimestamp = yield neuCall(markTransactionAsPending, txHash, txData, txMetadata);

    yield put(actions.txSender.txSenderSigned(txHash, type, txTimestamp));

    return txHash;
  } catch (error) {
    // Set timestamp for failed transaction
    yield put(actions.txSender.setTimestamp(Date.now()));

    if (
      error instanceof LedgerError ||
      error instanceof LightError ||
      error instanceof BrowserWalletError ||
      error instanceof SignerError
    ) {
      throw error;
    }

    // @see https://github.com/paritytech/parity-ethereum/blob/61f4534e2a5f9c947661af0eaf4af5b76456efe0/rpc/src/v1/helpers/errors.rs#L304
    if (
      error.code === -32010 &&
      error.message.startsWith("Insufficient funds. The account you tried to send transaction")
    ) {
      return yield put(actions.txSender.txSenderError(ETransactionErrorType.NOT_ENOUGH_FUNDS));
    }

    if (
      (error.code === -32000 && error.message === "intrinsic gas too low") ||
      (error.code === -32010 &&
        error.message.startsWith("Transaction gas is too low. There is not enough")) ||
      (error.code === -32010 && error.message.startsWith("exceeds current gas limit"))
    ) {
      throw new OutOfGasError();
    }

    if (error.code === -32010 && error.message.startsWith("Transaction nonce is too low")) {
      throw new LowNonceError();
    }

    if (
      error.code === -32010 &&
      error.message.startsWith("There are too many transactions in the queue")
    ) {
      throw new LongTransactionQueError();
    }

    if (error.code === -32010 && error.message.startsWith("Invalid RLP data")) {
      throw new InvalidRlpDataError();
    }

    if (error.code === -32010 && error.message.startsWith("Invalid chain id")) {
      throw new InvalidChangeIdError();
    }

    throw new UnknownEthNodeError(error);
  }
}

function* watchPendingOOOTxSubSaga({ logger }: TGlobalDependencies, txHash: string): any {
  logger.info(`Watching for out of bound transaction: ${txHash}`);

  yield createWatchTxChannel(txHash, function*(
    txChannel: Channel<TEventEmitterChannelEvents>,
  ): Generator<any, any, any> {
    while (true) {
      const result: TEventEmitterChannelEvents = yield take(txChannel);
      if (result.type === EEventEmitterChannelEvents.NEW_BLOCK) {
        yield put(actions.txSender.txSenderReportBlock(result.blockId));
      } else {
        if (result.type === EEventEmitterChannelEvents.ERROR) {
          logger.warn(`Error while watching pending Tx ${txHash}`, result.error);
        }
        return;
      }
    }
  });
}

function* watchTxSubSaga(
  { logger }: TGlobalDependencies,
  txHash: string,
): Generator<any, any, any> {
  logger.info(`Watching for transaction: ${txHash}`);

  yield createWatchTxChannel(txHash, function*(
    txChannel: Channel<TEventEmitterChannelEvents>,
  ): Generator<any, any, any> {
    while (true) {
      const result: TEventEmitterChannelEvents = yield take(txChannel);

      switch (result.type) {
        case EEventEmitterChannelEvents.NEW_BLOCK:
          yield put(actions.txSender.txSenderReportBlock(result.blockId));
          break;

        case EEventEmitterChannelEvents.TX_MINED:
          yield neuCall(updatePendingTxs);
          return yield put(actions.txSender.txSenderTxMined());

        /**
         * NON TERMINAL ERRORS - Tx Mining should continue
         */

        case EEventEmitterChannelEvents.ERROR:
          logger.error("Error while tx watching: ", result.error, { txHash });
          break;

        /**
         * TERMINAL ERRORS - Tx Mining should exit
         */

        case EEventEmitterChannelEvents.CANCELLED:
          logger.warn("Error Transaction was cancelled from transactional node: ", result.error, {
            txHash,
          });
          return yield put(actions.txSender.txSenderError(ETransactionErrorType.TX_WAS_REJECTED));

        case EEventEmitterChannelEvents.OUT_OF_GAS:
          logger.warn("Error Transaction out of gas: ", result.error, { txHash });
          return yield put(actions.txSender.txSenderError(ETransactionErrorType.OUT_OF_GAS));

        case EEventEmitterChannelEvents.REVERTED_TRANSACTION:
          logger.warn("Error Transaction Reverted: ", result.error, { txHash });
          return yield put(actions.txSender.txSenderError(ETransactionErrorType.REVERTED_TX));
      }
    }
  });
}

function* cleanUpTxSender(): Generator<any, any, any> {
  // Conduct any general cleanup operations
  yield put(actions.txValidator.clearValidationState());
  yield put(actions.txUserFlowTransfer.clearDraftTx());
}

function* updateRelatedValues(): Generator<any, any, any> {
  yield put(actions.wallet.loadWalletData());
}

export const txSenderSagasWatcher = function*(): Generator<any, any, any> {
  yield takeLatest("TX_SENDER_HIDE_MODAL", cleanUpTxSender);
  yield takeLatest(["TX_SENDER_TX_MINED", "TX_SENDER_ERROR"], updateRelatedValues);
};
