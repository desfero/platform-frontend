import { AppReducer } from "@neufund/sagas";
import { DeepReadonly, Dictionary } from "@neufund/shared-utils";
import { compose, keyBy, reverse, sortBy } from "lodash/fp";

import { txHistoryActions } from "./actions";
import { TTxHistory } from "./types";

export enum EModuleStatus {
  LOADING,
  IDLE,
}

export interface ITxHistoryState {
  transactionsByHash: Dictionary<TTxHistory> | undefined;
  transactionsOrder: string[] | undefined;
  // Used to load check whether we have more transactions to load
  timestampOfLastChange: number | undefined;
  lastTransactionId: string | undefined;
  status: EModuleStatus;
}

const initialState: ITxHistoryState = {
  transactionsByHash: undefined,
  transactionsOrder: undefined,
  lastTransactionId: undefined,
  timestampOfLastChange: undefined,
  status: EModuleStatus.IDLE,
};

const txHistoryReducer: AppReducer<ITxHistoryState, typeof txHistoryActions> = (
  state = initialState,
  action,
): DeepReadonly<ITxHistoryState> => {
  switch (action.type) {
    case txHistoryActions.loadTransactions.getType():
    case txHistoryActions.loadNextTransactions.getType():
      return {
        ...state,
        status: EModuleStatus.LOADING,
      };
    case txHistoryActions.setTransactions.getType(): {
      // Only set new transactions when what we have in the store differs
      // from what we have get from the api
      if (action.payload.timestampOfLastChange === state.timestampOfLastChange) {
        return {
          ...state,
          status: EModuleStatus.IDLE,
        };
      }

      return {
        ...state,
        transactionsOrder: action.payload.transactions.map(tx => tx.id),
        transactionsByHash: keyBy(tx => tx.id, action.payload.transactions),
        lastTransactionId: action.payload.lastTransactionId,
        timestampOfLastChange: action.payload.timestampOfLastChange,
        status: EModuleStatus.IDLE,
      };
    }
    case txHistoryActions.appendTransactions.getType(): {
      const order = state.transactionsOrder;
      const transactions = state.transactionsByHash;

      if (order === undefined || transactions === undefined) {
        throw new Error("Invalid tx history module state");
      }

      return {
        ...state,
        transactionsOrder: order.concat(action.payload.transactions.map(tx => tx.id)),
        transactionsByHash: {
          ...transactions,
          ...keyBy(tx => tx.id, action.payload.transactions),
        },
        lastTransactionId: action.payload.lastTransactionId,
        status: EModuleStatus.IDLE,
      };
    }

    case txHistoryActions.updateTransactions.getType(): {
      const currentTransactionsOrder = state.transactionsOrder || [];
      const currentTransactionsByHash = state.transactionsByHash || {};

      const newTransactionsIds = action.payload.transactions
        .filter(tx => !currentTransactionsByHash[tx.id])
        .map(tx => tx.id);

      const transactionsByHash = {
        ...currentTransactionsByHash,
        ...keyBy(tx => tx.id, action.payload.transactions),
      };

      // sort transactions by block number, transaction index and log index
      // there is an edge case where new transaction can appear between existing ones
      const transactionsOrder = compose(
        reverse,
        sortBy([
          tx => transactionsByHash[tx].blockNumber,
          tx => transactionsByHash[tx].transactionIndex,
          tx => transactionsByHash[tx].logIndex,
        ]),
      )(newTransactionsIds.concat(currentTransactionsOrder));

      return {
        ...state,
        transactionsOrder,
        transactionsByHash,
        lastTransactionId: action.payload.lastTransactionId,
        timestampOfLastChange: action.payload.timestampOfLastChange,
      };
    }
  }

  return state;
};

const txHistoryReducerMap = {
  txHistory: txHistoryReducer,
};

export { txHistoryReducerMap };
