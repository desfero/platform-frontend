import { createActionFactory } from "@neufund/shared-utils";

import { TxUserFlowInputData } from "../types";

export const txUserFlowWithdrawActions = {
  runUserFlowOperations: createActionFactory(
    "TX_USER_FLOW_DETECT_WITHDRAW_MAX",
    (txUserFlowData: TxUserFlowInputData) => ({
      ...txUserFlowData,
    }),
  ),
};
