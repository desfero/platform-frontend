import { DeepReadonly } from "@neufund/shared-utils";

import { TPendingTxs } from "../../../lib/api/users-tx/interfaces";
import { AppReducer } from "../../../store";

export interface ITxMonitorState {
  txs: TPendingTxs;
}

const initialState: ITxMonitorState = {
  txs: { pendingTransaction: undefined, oooTransactions: [] },
};

export const txMonitorReducer: AppReducer<ITxMonitorState> = (
  state = initialState,
  action,
): DeepReadonly<ITxMonitorState> => {
  switch (action.type) {
    case "TX_MONITOR_LOAD_TXS":
      return {
        txs: { ...state.txs, ...action.payload.txs },
      };
  }

  return state;
};
