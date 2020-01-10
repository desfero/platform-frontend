import { fork } from "@neufund/sagas";

import { txUserFlowInvestmentSagas } from "./investment/sagas";
import { txTransferUserFlowSagasWatcher } from "./transfer/sagas";
import { txTokenTransferFlowSagasWatcher } from "./transfer/token-transfer/sagas";
import { txWithdrawUserFlowSagasWatcher } from "./transfer/withdraw/sagas";

export const txUserFlowSagasWatcher = function*(): Generator<any, any, any> {
  yield fork(txWithdrawUserFlowSagasWatcher);
  yield fork(txTransferUserFlowSagasWatcher);
  yield fork(txTokenTransferFlowSagasWatcher);
  yield fork(txUserFlowInvestmentSagas);
};
