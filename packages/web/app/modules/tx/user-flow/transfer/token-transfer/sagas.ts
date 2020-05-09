import { fork, put, select } from "@neufund/sagas";
import { convertFromUlps } from "@neufund/shared-utils";

import { TGlobalDependencies } from "../../../../../di/setupBindings";
import { ETxType } from "../../../../../lib/web3/types";
import { actions, TActionFromCreator } from "../../../../actions";
import { neuDebounce } from "../../../../sagasUtils";
import { selectUserFlowTokenDecimals, selectUserFlowUserBalance } from "../selectors";
import { toFormValue } from "../utils";

function* detectMaxWithdraw(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.txUserFlowWithdraw.runUserFlowOperations>,
): Generator<any, any, any> {
  const { to, value } = action.payload;

  let modifiedValue = value;

  const userBalance: string = yield select(selectUserFlowUserBalance);
  const tokenDecimals: number = yield select(selectUserFlowTokenDecimals);

  const fixedToken = toFormValue(userBalance, tokenDecimals);

  if (fixedToken === value) {
    modifiedValue = convertFromUlps(userBalance, tokenDecimals).toString();
  }
  yield put(
    actions.txValidator.validateDraft({
      to,
      value: modifiedValue,
      type: ETxType.TRANSFER_TOKENS,
    }),
  );
  yield put(
    actions.txUserFlowTransfer.setTxUserFlowInputData({
      to,
      value,
    }),
  );
}

export const txTokenTransferFlowSagasWatcher = function*(): Generator<any, any, any> {
  yield fork(
    neuDebounce,
    300,
    actions.txUserFlowTokenTransfer.runUserFlowOperations,
    detectMaxWithdraw,
  );
};
