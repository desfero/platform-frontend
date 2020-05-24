import { createActionFactory } from "@neufund/shared-utils";

import { TPendingTxs } from "../../../lib/api/users-tx/interfaces";
import { createAction } from "../../actionsUtils";

export const txMonitorActions = {
  monitorPendingPlatformTx: createActionFactory("TX_MONITOR_PENDING_PLATFORM_TX"),
  setPendingTxs: (txs: Partial<TPendingTxs>) => createAction("TX_MONITOR_LOAD_TXS", { txs }),
  deletePendingTransaction: createActionFactory("TRANSACTIONS_DELETE_PENDING_TRANSACTION"),
  stopTxMonitor: createActionFactory("STOP_TX_MONITOR"),
};
