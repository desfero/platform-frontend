import { createSelector } from "reselect";

import { ENumberInputFormat } from "../../../components/shared/formatters/utils";
import { ETransactionDirection } from "../../../lib/api/analytics-api/interfaces";
import { TxPendingExternal, TxPendingWithMetadata } from "../../../lib/api/users/interfaces";
import { ETxType } from "../../../lib/web3/types";
import { TAppGlobalState } from "../../../store";
import { ETransactionStatus } from "../../tx-history/types";
import { ETxSenderState } from "../sender/reducer";
import {
  getPendingTransactionAmount,
  getPendingTransactionCurrency,
  getPendingTransactionType,
} from "../utils";

export const selectAreTherePlatformPendingTxs = (state: TAppGlobalState): boolean => {
  const pendingTransaction = state.txMonitor.txs.pendingTransaction;
  return !!pendingTransaction && pendingTransaction.transactionStatus === ETxSenderState.MINING;
};

export const selectPlatformPendingTransaction = (
  state: TAppGlobalState,
): TxPendingWithMetadata | undefined =>
  state.txMonitor.txs.pendingTransaction as TxPendingWithMetadata | undefined;

export const selectExternalPendingTransaction = (
  state: TAppGlobalState,
): TxPendingExternal | undefined => state.txMonitor.txs.oooTransactions[0];

export const selectAreTherePendingTxs = createSelector(
  selectAreTherePlatformPendingTxs,
  selectExternalPendingTransaction,
  (areTherePlatformPendingTxs, externalPendingTransaction) =>
    areTherePlatformPendingTxs || !!externalPendingTransaction,
);

export const selectPlatformMiningTransaction = (
  state: TAppGlobalState,
): TxPendingWithMetadata | null => {
  const pending = selectPlatformPendingTransaction(state);
  if (pending && pending.transactionStatus === ETxSenderState.MINING) {
    const additionalData = pending.transactionAdditionalData
      ? {
          ...pending.transactionAdditionalData,
          amount: getPendingTransactionAmount(pending),
          currency: getPendingTransactionCurrency(pending),
          companyName:
            pending.transactionAdditionalData && pending.transactionAdditionalData.eto
              ? pending.transactionAdditionalData.eto.companyName
              : pending.transactionAdditionalData.companyName,
          isICBMInvestment: pending.transactionAdditionalData.isIcbm,
          amountEur: pending.transactionAdditionalData.investmentEur,
          equityTokenCurrency:
            pending.transactionAdditionalData.eto &&
            pending.transactionAdditionalData.eto.equityTokenSymbol,
          subType: ETransactionStatus.PENDING,
          transactionDirection:
            pending.transactionType === ETxType.WITHDRAW ||
            pending.transactionType === ETxType.TRANSFER_TOKENS
              ? ETransactionDirection.OUT
              : ETransactionDirection.IN,
          amountFormat: ENumberInputFormat.ULPS,
          type: getPendingTransactionType(pending),
        }
      : null;

    return {
      ...pending,
      transactionAdditionalData: additionalData,
    };
  } else {
    return null;
  }
};
