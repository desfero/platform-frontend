import { ETransactionDirection, ETransactionStatus } from "@neufund/shared-modules";
import { createSelector } from "reselect";

import { ENumberInputFormat } from "../../../components/shared/formatters/utils";
import { TxPendingWithMetadata, TxWithMetadata } from "../../../lib/api/users-tx/interfaces";
import { TAppGlobalState } from "../../../store";
import { ETxSenderState } from "../sender/reducer";
import { ETxSenderType } from "../types";
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
): TxWithMetadata | undefined => state.txMonitor.txs.oooTransactions[0];

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
            pending.transactionType === ETxSenderType.WITHDRAW ||
            pending.transactionType === ETxSenderType.TRANSFER_TOKENS
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
