import {
  all,
  delay,
  fork,
  neuCall,
  neuTakeLatest,
  neuTakeUntil,
  put,
  SagaGenerator,
  select,
  // take,
} from "@neufund/sagas";
import {
  ECurrency,
  EthereumAddressWithChecksum,
  StringableActionCreator,
  subtractBigNumbers,
} from "@neufund/shared-utils";

import { createMessage } from "../../messages";
import { neuGetBindings } from "../../utils";
import { authModuleAPI } from "../auth/module";
import { coreModuleApi } from "../core/module";
import { notificationUIModuleApi } from "../notification-ui/module";
import { selectEurEquivalent } from "../token-price/selectors";
import { txHistoryActions } from "./actions";
import { TX_LIMIT, TX_REFRESH_DELAY } from "./constants";
import {
  ETransactionType,
  TAnalyticsTransaction,
  TAnalyticsTransactionsResponse,
} from "./lib/http/analytics-api/interfaces";
import { ETxHistoryMessage } from "./messages";
import { TTXHistoryModuleState } from "./module";
import { selectLastTransactionId, selectTimestampOfLastChange } from "./selectors";
import { symbols } from "./symbols";
import { ETransactionStatus, ETransactionSubType, TTxHistory, TTxHistoryCommon } from "./types";
import { getCurrencyFromTokenSymbol, getDecimalsFormat, getTxUniqueId } from "./utils";

type TGlobalDependencies = unknown;

function getTransactionCommon(transaction: TAnalyticsTransaction): TTxHistoryCommon {
  return {
    amount: transaction.extraData.amount.toString(),
    amountFormat: getDecimalsFormat(transaction.extraData.tokenMetadata),
    blockNumber: transaction.blockNumber,
    date: transaction.blockTime,
    id: getTxUniqueId(transaction),
    logIndex: transaction.logIndex,
    transactionDirection: transaction.transactionDirection,
    transactionIndex: transaction.transactionIndex,
    txHash: transaction.txHash,
  };
}

export function* mapAnalyticsApiTransactionResponse(
  _: TGlobalDependencies,
  transaction: TAnalyticsTransaction,
): Generator<any, any, any> {
  // we can return tx in each case but then we will loose type safety
  let tx: TTxHistory | undefined = undefined;
  const { logger, ethManager } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
    ethManager: authModuleAPI.symbols.ethManager,
  });

  switch (transaction.type) {
    case ETransactionType.ETO_INVESTMENT: {
      if (!transaction.extraData.assetTokenMetadata || !transaction.extraData.tokenMetadata) {
        throw new Error("Invalid asset token metadata");
      }

      const neuReward = transaction.extraData.neumarkReward!.toString();
      const neuRewardEur: string = yield select((state: TTXHistoryModuleState) =>
        selectEurEquivalent(state, neuReward, ECurrency.NEU),
      );

      const address: EthereumAddressWithChecksum = yield ethManager.getWalletAddress();

      // if funds from ICBM were used then wallet_address != address
      const isICBMInvestment = transaction.extraData.walletAddress !== address;

      // investment is completed when it was either claimed or refunded
      const isCompleted = !!transaction.extraData.isClaimed || !!transaction.extraData.isRefunded;

      tx = {
        ...getTransactionCommon(transaction),
        neuReward,
        neuRewardEur,
        isICBMInvestment,
        amountEur: transaction.extraData.baseCurrencyEquivalent!.toString(),
        companyName: transaction.extraData.assetTokenMetadata.companyName!,
        currency: getCurrencyFromTokenSymbol(transaction.extraData.tokenMetadata),
        equityTokenAmount: transaction.extraData.grantedAmount!.toString(),
        equityTokenAmountFormat: getDecimalsFormat(transaction.extraData.assetTokenMetadata),
        equityTokenCurrency: transaction.extraData.assetTokenMetadata.tokenSymbol,
        equityTokenIcon: transaction.extraData.assetTokenMetadata.tokenImage!,
        etoId: transaction.extraData.assetTokenMetadata.tokenCommitmentAddress!,
        toAddress: transaction.extraData.toAddress!,
        fromAddress: transaction.extraData.tokenAddress!,
        subType: isCompleted ? ETransactionStatus.COMPLETED : ETransactionStatus.PENDING,
        type: transaction.type,
      };
      break;
    }
    case ETransactionType.ETO_REFUND: {
      if (!transaction.extraData.assetTokenMetadata || !transaction.extraData.tokenMetadata) {
        throw new Error("Invalid asset token metadata");
      }

      const common = getTransactionCommon(transaction);

      const currency = getCurrencyFromTokenSymbol(transaction.extraData.tokenMetadata);

      const amountEur: string = yield select((state: TTXHistoryModuleState) =>
        selectEurEquivalent(state, common.amount, currency),
      );

      const toAddress: EthereumAddressWithChecksum = yield ethManager.getWalletAddress();

      tx = {
        ...common,
        currency,
        amountEur,
        toAddress,
        subType: undefined,
        etoId: transaction.extraData.assetTokenMetadata.tokenCommitmentAddress!,
        type: transaction.type,
        companyName: transaction.extraData.assetTokenMetadata.companyName!,
      };
      break;
    }
    case ETransactionType.TRANSFER: {
      // In case it's an equity token transaction
      if (transaction.extraData.tokenInterface === "equityTokenInterface") {
        tx = {
          ...getTransactionCommon(transaction),
          type: transaction.type,
          subType: ETransactionSubType.TRANSFER_EQUITY_TOKEN,
          currency: transaction.extraData.tokenMetadata!.tokenSymbol,
          etoId: transaction.extraData.tokenMetadata!.tokenCommitmentAddress!,
          icon: transaction.extraData.tokenMetadata!.tokenImage!,
          fromAddress: transaction.extraData.fromAddress!,
          toAddress: transaction.extraData.toAddress!,
        };
      } else {
        const common = getTransactionCommon(transaction);

        const currency = getCurrencyFromTokenSymbol(transaction.extraData.tokenMetadata);

        const amountEur: string = yield select((state: TTXHistoryModuleState) =>
          selectEurEquivalent(state, common.amount, currency),
        );

        tx = {
          ...common,
          currency,
          amountEur,
          subType: undefined,
          type: transaction.type,
          toAddress: transaction.extraData.toAddress!,
          fromAddress: transaction.extraData.fromAddress!,
        };
      }
      break;
    }
    case ETransactionType.NEUR_PURCHASE: {
      tx = {
        ...getTransactionCommon(transaction),
        subType: undefined,
        type: transaction.type,
        currency: ECurrency.EUR_TOKEN,
        toAddress: transaction.extraData.toAddress!,
      };
      break;
    }
    case ETransactionType.NEUR_REDEEM: {
      if (transaction.extraData.settledAmount) {
        const common = getTransactionCommon(transaction);
        const settledAmount = transaction.extraData.settledAmount.toString();

        tx = {
          ...getTransactionCommon(transaction),
          settledAmount,
          subType: ETransactionStatus.COMPLETED,
          type: transaction.type,
          currency: ECurrency.EUR_TOKEN,
          reference: transaction.extraData.reference!,
          fromAddress: transaction.extraData.fromAddress!,
          feeAmount: subtractBigNumbers([common.amount, settledAmount]),
        };
      } else {
        tx = {
          ...getTransactionCommon(transaction),
          subType: ETransactionStatus.PENDING,
          type: transaction.type,
          currency: ECurrency.EUR_TOKEN,
          reference: transaction.extraData.reference!,
          fromAddress: transaction.extraData.fromAddress!,
        };
      }

      break;
    }
    case ETransactionType.NEUR_DESTROY: {
      tx = {
        ...getTransactionCommon(transaction),
        subType: undefined,
        type: transaction.type,
        currency: ECurrency.EUR_TOKEN,
        liquidatedByAddress: transaction.extraData.byAddress!,
      };
      break;
    }
    case ETransactionType.ETO_TOKENS_CLAIM:
      {
        if (!transaction.extraData.assetTokenMetadata) {
          throw new Error("Asset token metadata should be provided");
        }

        const neuReward = transaction.extraData.neumarkReward!.toString();

        const neuRewardEur: string = yield select((state: TTXHistoryModuleState) =>
          selectEurEquivalent(state, neuReward, ECurrency.NEU),
        );

        tx = {
          ...getTransactionCommon(transaction),
          neuReward,
          neuRewardEur,
          subType: undefined,
          type: transaction.type,
          amountFormat: getDecimalsFormat(transaction.extraData.assetTokenMetadata),
          currency: transaction.extraData.assetTokenMetadata.tokenSymbol,
          etoId: transaction.extraData.assetTokenMetadata.tokenCommitmentAddress!,
          icon: transaction.extraData.assetTokenMetadata.tokenImage!,
        };
      }
      break;

    case ETransactionType.PAYOUT: {
      if (!transaction.extraData.tokenMetadata) {
        throw new Error("Invalid token metadata");
      }

      const common = getTransactionCommon(transaction);

      const currency = getCurrencyFromTokenSymbol(transaction.extraData.tokenMetadata);

      const amountEur: string = yield select((state: TTXHistoryModuleState) =>
        selectEurEquivalent(state, common.amount, currency),
      );

      const toAddress: EthereumAddressWithChecksum = yield ethManager.getWalletAddress();

      tx = {
        ...common,
        currency,
        amountEur,
        toAddress,
        subType: undefined,
        type: transaction.type,
      };
      break;
    }
    case ETransactionType.REDISTRIBUTE_PAYOUT: {
      if (!transaction.extraData.tokenMetadata) {
        throw new Error("Invalid token metadata");
      }
      const common = getTransactionCommon(transaction);

      const currency = getCurrencyFromTokenSymbol(transaction.extraData.tokenMetadata);

      const amountEur: string = yield select((state: TTXHistoryModuleState) =>
        selectEurEquivalent(state, common.amount, currency),
      );

      tx = {
        ...common,
        currency,
        amountEur,
        subType: undefined,
        type: transaction.type,
      };
      break;
    }
    // Add temporary new transaction types to prevent logging warnings
    case ETransactionType.ETO_RELEASE_FUNDS:
    case ETransactionType.ETO_RELEASE_CAPITAL_INCREASE:
    case ETransactionType.ETO_COMPANY_SIGNED_AGREEMENT:
    case ETransactionType.ETO_TERMS_SET:
    case ETransactionType.ETO_START_DATE_SET:
    case ETransactionType.NOMINEE_CONFIRMED_AGREEMENT:
    case ETransactionType.GAS_EXCHANGE:
    case ETransactionType.ICBM_FUNDS_MIGRATED:
    case ETransactionType.ICBM_FUNDS_UNLOCKED:
    case ETransactionType.ICBM_UNLOCK_PENALTY: {
      tx = undefined;
      break;
    }
    default:
      logger.warn(new Error(`Transaction with unknown type received ${transaction.type}`));
  }

  return tx;
}

export function* mapAnalyticsApiTransactionsResponse(
  _: TGlobalDependencies,
  transactions: readonly TAnalyticsTransaction[],
): Generator<any, any, any> {
  const txHistoryTransactions: ReadonlyArray<TTxHistory | undefined> = yield all(
    transactions.map(tx => neuCall(mapAnalyticsApiTransactionResponse, tx)),
  );

  return txHistoryTransactions.filter(Boolean);
}

export function* loadTransactionsHistoryNext(_: TGlobalDependencies): Generator<any, any, any> {
  const { logger, analyticsApi } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
    analyticsApi: symbols.analyticsApi,
  });

  try {
    const lastTransactionId: string | undefined = yield select(selectLastTransactionId);

    const {
      transactions,
      beforeTransaction: newLastTransactionId,
    }: TAnalyticsTransactionsResponse = yield analyticsApi.getTransactionsList(
      TX_LIMIT,
      lastTransactionId,
    );

    const processedTransactions: TTxHistory[] = yield neuCall(
      mapAnalyticsApiTransactionsResponse,
      transactions,
    );

    yield put(txHistoryActions.appendTransactions(processedTransactions, newLastTransactionId));
  } catch (e) {
    yield put(
      notificationUIModuleApi.actions.showError(
        createMessage(ETxHistoryMessage.TX_HISTORY_FAILED_TO_LOAD_NEXT),
      ),
    );

    logger.error("Error while loading next page of transaction history", e);
  }
}

export function* loadTransactionsHistory(_: TGlobalDependencies): Generator<any, any, any> {
  const { logger, analyticsApi } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
    analyticsApi: symbols.analyticsApi,
  });

  try {
    const {
      transactions,
      beforeTransaction: lastTransactionId,
      version: newTimestampOfLastChange,
    }: TAnalyticsTransactionsResponse = yield analyticsApi.getTransactionsList(TX_LIMIT);

    const processedTransactions = yield neuCall(mapAnalyticsApiTransactionsResponse, transactions);

    yield put(
      txHistoryActions.setTransactions(
        processedTransactions,
        lastTransactionId,
        newTimestampOfLastChange,
      ),
    );

    yield put(txHistoryActions.startWatchingForNewTransactions());
  } catch (e) {
    yield put(
      notificationUIModuleApi.actions.showError(
        createMessage(ETxHistoryMessage.TX_HISTORY_FAILED_TO_LOAD),
      ),
    );

    logger.error("Error while loading transaction history", e);

    yield put(txHistoryActions.setTransactions([], undefined, undefined));
  }
}

export function* watchTransactions(
  _: TGlobalDependencies,
  __: StringableActionCreator<any, any, any> | undefined,
): Generator<any, any, any> {
  const { logger, analyticsApi } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
    analyticsApi: symbols.analyticsApi,
  });

  while (true) {
    try {
      /*
      TODO: comment back in as soon as the typing is figured out
      if (refreshOnAction) {
        yield* take(refreshOnAction);
      } else {
        yield delay(TX_REFRESH_DELAY);
      }
      */
      yield delay(TX_REFRESH_DELAY);

      const timestampOfLastChange: number | undefined = yield select(selectTimestampOfLastChange);

      if (timestampOfLastChange === undefined) {
        logger.error(
          new Error("Transaction latest version can't be undefined. Stopping transaction polling"),
        );
        break;
      }

      const {
        version: newTimestampOfLastChange,
        transactions,
        beforeTransaction: lastTransactionId,
      }: TAnalyticsTransactionsResponse = yield analyticsApi.getUpdatedTransactions(
        timestampOfLastChange,
      );

      // check if version is higher than existing and of we have new transactions
      if (
        newTimestampOfLastChange !== undefined &&
        newTimestampOfLastChange > timestampOfLastChange &&
        transactions.length > 0
      ) {
        const processedTransactions: TTxHistory[] = yield neuCall(
          mapAnalyticsApiTransactionsResponse,
          transactions,
        );

        yield put(
          txHistoryActions.updateTransactions(
            processedTransactions,
            lastTransactionId,
            newTimestampOfLastChange,
          ),
        );
      }
    } catch (e) {
      // Log error and continue looping
      logger.error("Failed to watch for analytics transaction", e);
    }
  }
}

type TSetupSagasConfig = {
  refreshOnAction: StringableActionCreator<any, any, any> | undefined;
};

export function setupTXHistorySagas(_: TSetupSagasConfig): () => SagaGenerator<void> {
  return function* txHistorySaga(): SagaGenerator<any, any> {
    yield fork(neuTakeLatest, txHistoryActions.loadTransactions, loadTransactionsHistory);
    yield fork(neuTakeLatest, txHistoryActions.loadNextTransactions, loadTransactionsHistoryNext);
    yield fork(
      neuTakeUntil,
      txHistoryActions.startWatchingForNewTransactions,
      txHistoryActions.stopWatchingForNewTransactions,
      watchTransactions,
      // config.refreshOnAction, // TODO: this should be commented in, but types don't work
    );
  };
}
