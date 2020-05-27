import { put, select } from "@neufund/sagas";
import { walletApi } from "@neufund/shared-modules";
import { addBigNumbers, convertToUlps, multiplyBigNumbers } from "@neufund/shared-utils";

import { TGlobalDependencies } from "../../../../../di/setupBindings";
import { ITxData } from "../../../../../lib/web3/types";
import { UserHasNoFundsError } from "../../../../../lib/web3/Web3Adapter";
import { actions } from "../../../../actions";
import { neuCall } from "../../../../sagasUtils";
import { selectEtherPriceEur } from "../../../../shared/tokenPrice/selectors";
import { isAddressValid } from "../../../../web3/utils";
import { generateEthWithdrawTransaction } from "../../../transactions/withdraw/sagas";
import { IWithdrawDraftType } from "../../../types";
import { EAdditionalValidationDataNotifications, EValidationState } from "../../reducer";
import {
  mapErrorToTransferTxError,
  prepareTransferValidation,
  runInitialValidations,
  shouldPassSmartContractAcceptEtherTest,
} from "../sagas";
import { SmartContractDoesNotAcceptEtherError } from "./errors";

export function* txValidateWithdraw(userInput: IWithdrawDraftType): Generator<any, any, any> {
  try {
    const {
      modifiedUserInput,
      isValidAddress,
      isValueValid,
    }: any = yield prepareTransferValidation(userInput);

    if (!shouldPassSmartContractAcceptEtherTest) {
      yield neuCall(isAddressValidAcceptsEther, modifiedUserInput.to, modifiedUserInput.value);
    }
    const valueUlps = convertToUlps(modifiedUserInput.value);

    const generatedTxDetails: ITxData = yield neuCall(generateEthWithdrawTransaction, {
      to: modifiedUserInput.to,
      valueUlps,
    });

    yield runInitialValidations(
      generatedTxDetails,
      [
        EAdditionalValidationDataNotifications.IS_NEW_ADDRESS_WITH_BALANCE,
        EAdditionalValidationDataNotifications.IS_SMART_CONTRACT,
        EAdditionalValidationDataNotifications.IS_VERIFIED_PLATFORM_USER,
        EAdditionalValidationDataNotifications.WILL_EMPTY_WALLET,
        EAdditionalValidationDataNotifications.IS_NEW_ADDRESS,
      ],
      isValidAddress && modifiedUserInput.to,
      isValueValid && modifiedUserInput.value,
    );

    const euroPrice = yield* select(selectEtherPriceEur);

    const valueFromUserEuro = multiplyBigNumbers([euroPrice, valueUlps]);
    const transactionCost = multiplyBigNumbers([
      generatedTxDetails.gasPrice,
      generatedTxDetails.gas,
    ]);
    const totalValue = addBigNumbers([valueUlps, transactionCost]);

    yield put(
      actions.txUserFlowTransfer.setTxUserFlowData({
        inputValue: valueUlps,
        inputValueEuro: valueFromUserEuro,
        inputTo: isAddressValid ? userInput.to : "0x",
        totalValue: totalValue,
        totalValueEur: multiplyBigNumbers([totalValue, euroPrice]),
        transactionCost,
        transactionCostEur: multiplyBigNumbers([transactionCost, euroPrice]),
      }),
    );
    if (isAddressValid && isValueValid) {
      yield put(actions.txSender.setTransactionData(generatedTxDetails));
      yield put(actions.txValidator.setValidationState(EValidationState.VALIDATION_OK));
    } else {
      yield put(actions.txValidator.setValidationState(EValidationState.PARTIALLY_OK));
    }
  } catch (error) {
    yield mapErrorToTransferTxError(error);
  }
}

export function* isAddressValidAcceptsEther(
  { web3Manager }: TGlobalDependencies,
  to: string,
  value: string,
): Generator<any, any, any> {
  try {
    const etherBalance = yield* select(walletApi.selectors.selectEtherBalanceAsBigNumber);
    if (etherBalance.isZero()) {
      throw new UserHasNoFundsError();
    }

    // If user inputs no value assume 1 wei as fallback value
    const calculatedValueFromUserInput = value === "0" ? "1" : convertToUlps(value);
    yield web3Manager.estimateGas({ to, value: calculatedValueFromUserInput });
  } catch (e) {
    if (e instanceof UserHasNoFundsError) {
      throw e;
    } else {
      throw new SmartContractDoesNotAcceptEtherError();
    }
  }
}
