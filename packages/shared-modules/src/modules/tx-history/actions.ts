import { createActionFactory } from "@neufund/shared-utils";

import { TTxHistory } from "./types";

export const txHistoryActions = {
  // public actions
  loadTransactions: createActionFactory("TX_HISTORY_LOAD_TRANSACTIONS"),
  loadNextTransactions: createActionFactory("TX_HISTORY_LOAD_NEXT_TRANSACTIONS"),
  startWatchingForNewTransactions: createActionFactory(
    "TX_HISTORY_START_WATCHING_FOR_NEW_TRANSACTIONS",
  ),
  stopWatchingForNewTransactions: createActionFactory(
    "TX_HISTORY_STOP_WATCHING_FOR_NEW_TRANSACTIONS",
  ),
  showTransactionDetails: createActionFactory(
    "TX_HISTORY_SHOW_TRANSACTION_DETAILS",
    (id: string) => ({ id }),
  ),

  // private actions to mutate the store
  setTransactions: createActionFactory(
    "TX_HISTORY_SET_TRANSACTIONS",
    (
      transactions: TTxHistory[],
      lastTransactionId: string | undefined,
      timestampOfLastChange: number | undefined,
    ) => ({
      transactions,
      lastTransactionId,
      timestampOfLastChange,
    }),
  ),
  appendTransactions: createActionFactory(
    "TX_HISTORY_APPEND_TRANSACTIONS",
    (transactions: TTxHistory[], lastTransactionId: string | undefined) => ({
      transactions,
      lastTransactionId,
    }),
  ),
  updateTransactions: createActionFactory(
    "TX_HISTORY_UPDATE_TRANSACTIONS",
    (
      transactions: TTxHistory[],
      lastTransactionId: string | undefined,
      timestampOfLastChange: number | undefined,
    ) => ({
      transactions,
      lastTransactionId,
      timestampOfLastChange,
    }),
  ),
};
