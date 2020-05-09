import { fork, put, select } from "@neufund/sagas";
import { multiplyBigNumbers, Q18, subtractBigNumbers } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";

import { TGlobalDependencies } from "../../../../../di/setupBindings";
import { ETxType, ITxData } from "../../../../../lib/web3/types";
import { actions, TActionFromCreator } from "../../../../actions";
import { neuCall, neuDebounce } from "../../../../sagasUtils";
import { selectLiquidEtherBalance } from "../../../../wallet/selectors";
import { generateRandomEthereumAddress, isAddressValid } from "../../../../web3/utils";
import { generateEthWithdrawTransaction } from "../../../transactions/withdraw/sagas";
import { SmartContractDoesNotAcceptEtherError } from "../../../validator/transfer/withdraw/errors";
import { isAddressValidAcceptsEther } from "../../../validator/transfer/withdraw/sagas";
import { toFormValue } from "../utils";

export function* getMaxWithdrawAmount(to: string | undefined): Generator<any, any, any> {
  const maxEtherUlps: string = yield select(selectLiquidEtherBalance);

  const txDetails: ITxData = yield neuCall(generateEthWithdrawTransaction, {
    to: to || generateRandomEthereumAddress(),
    valueUlps: maxEtherUlps,
  });

  const costUlps = multiplyBigNumbers([txDetails.gasPrice, txDetails.gas]);
  const valueUlps = subtractBigNumbers([maxEtherUlps, costUlps]);

  const maximumAvailableEther = new BigNumber(valueUlps).div(Q18).toString();
  return maximumAvailableEther;
}

export function* detectMaxWithdraw(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.txUserFlowWithdraw.runUserFlowOperations>,
): Generator<any, any, any> {
  // Add case where address is undefined
  // Add case where value is undefined
  const { to, value } = action.payload;

  let modifiedValue = value;

  const maxAvailEther = yield select(selectLiquidEtherBalance);
  const fixedEther = toFormValue(maxAvailEther);

  const modifiedTo = isAddressValid(to) ? to : generateRandomEthereumAddress();

  if (fixedEther === value) {
    try {
      yield neuCall(isAddressValidAcceptsEther, modifiedTo, modifiedValue);
      modifiedValue = yield getMaxWithdrawAmount(modifiedTo);
    } catch (error) {
      if (error instanceof SmartContractDoesNotAcceptEtherError) {
        modifiedValue = yield getMaxWithdrawAmount(generateRandomEthereumAddress());
      }
    }
  }
  yield put(
    actions.txValidator.validateDraft({ to, value: modifiedValue, type: ETxType.WITHDRAW }),
  );
  yield put(
    actions.txUserFlowTransfer.setTxUserFlowInputData({
      to,
      value,
    }),
  );
}

export const txWithdrawUserFlowSagasWatcher = function*(): Generator<any, any, any> {
  yield fork(neuDebounce, 300, actions.txUserFlowWithdraw.runUserFlowOperations, detectMaxWithdraw);
};
