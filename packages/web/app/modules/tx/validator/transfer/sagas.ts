import { put, select } from "@neufund/sagas";
import { walletApi } from "@neufund/shared-modules";
import {
  addBigNumbers,
  compareBigNumbers,
  multiplyBigNumbers,
  subtractBigNumbers,
} from "@neufund/shared-utils";
import { cloneDeep } from "lodash";

import { NotEnoughEtherForGasError, UserHasNoFundsError } from "../../../../lib/web3/Web3Adapter";
import { actions } from "../../../actions";
import { neuCall } from "../../../sagasUtils";
import { generateRandomEthereumAddress, isAddressValid } from "../../../web3/utils";
import { ITokenTransferDraftType, IWithdrawDraftType } from "../../types";
import { MINIMUM_ETH_RESERVE_GAS_UNITS } from "../../utils";
import { txProcessAddressValidations } from "../address/sagas";
import { EAdditionalValidationDataNotifications, EValidationState } from "../reducer";
import { validateGas } from "../sagas";
import { IWindowWithData } from "./../../../../../test/helperTypes";
import { ITxData } from "./../../../../lib/web3/types";
import { UserHasNotEnoughTokensError } from "./token-transfer/errors";
import { isValidFormNumber } from "./utils";
import { SmartContractDoesNotAcceptEtherError } from "./withdraw/errors";

export const shouldPassSmartContractAcceptEtherTest = !!(
  process.env.NF_CYPRESS_RUN === "1" && (window as IWindowWithData).disableNotAcceptingEtherCheck
);

export function* prepareTransferValidation(
  userInput: ITokenTransferDraftType | IWithdrawDraftType,
): Generator<any, any, any> {
  yield put(actions.txValidator.setValidationState(EValidationState.VALIDATING));

  yield put(actions.txSender.txSenderClearTransactionData());

  const modifiedUserInput = cloneDeep(userInput);
  const isValidAddress = isAddressValid(userInput.to);
  const isValueValid = isValidFormNumber(userInput.value);

  // Sanity checks
  if (!isValidAddress) {
    modifiedUserInput.to = generateRandomEthereumAddress();
  }

  if (!isValueValid) {
    modifiedUserInput.value = "0";
  }

  return { modifiedUserInput, isValidAddress, isValueValid };
}

export function* validateWalletAlmostEmpty({
  gasPrice,
  gas,
  value,
}: ITxData): Generator<any, any, any> {
  const allEther: string = yield select(walletApi.selectors.selectEtherBalance);

  let warnings: EAdditionalValidationDataNotifications[] = [];

  const requiredGasReserve = multiplyBigNumbers([gasPrice, MINIMUM_ETH_RESERVE_GAS_UNITS]);
  const maximumCost = multiplyBigNumbers([gasPrice, gas]);
  const maximumAvailableEther = subtractBigNumbers([allEther, maximumCost]);

  if (compareBigNumbers(addBigNumbers([value, requiredGasReserve]), maximumAvailableEther) >= 0) {
    warnings.push(EAdditionalValidationDataNotifications.WILL_EMPTY_WALLET);
  }

  return warnings;
}

export function* runInitialValidations(
  generatedTxDetails: ITxData,
  registeredChecks: EAdditionalValidationDataNotifications[],
  // use enum spread when it gets ready
  // https://github.com/microsoft/TypeScript/issues/31268
  address?: string,
  value?: string,
): Generator<any, any, any> {
  yield neuCall(validateGas, generatedTxDetails);

  const addressNotifications: EAdditionalValidationDataNotifications[] =
    address && !shouldPassSmartContractAcceptEtherTest
      ? yield neuCall(txProcessAddressValidations, address, registeredChecks)
      : [];

  const walletNotifications: EAdditionalValidationDataNotifications[] = value
    ? yield validateWalletAlmostEmpty(generatedTxDetails)
    : [];

  yield put(
    actions.txValidator.setValidationNotifications([
      ...walletNotifications,
      ...addressNotifications,
    ]),
  );
}

export function* mapErrorToTransferTxError(error: Error): Generator<any, any, any> {
  if (error instanceof UserHasNotEnoughTokensError) {
    yield put(actions.txValidator.setValidationState(EValidationState.NOT_ENOUGH_TOKENS));
  } else if (error instanceof NotEnoughEtherForGasError) {
    yield put(actions.txValidator.setValidationState(EValidationState.NOT_ENOUGH_ETHER_FOR_GAS));
  } else if (error instanceof UserHasNoFundsError) {
    // UserHasNoFundsError has its own condition check incase the error should be different in the future
    yield put(actions.txValidator.setValidationState(EValidationState.NOT_ENOUGH_ETHER_FOR_GAS));
  } else if (error instanceof SmartContractDoesNotAcceptEtherError) {
    if (shouldPassSmartContractAcceptEtherTest) {
      // ONLY FOR TESTING PURPOSE
      yield put(actions.txValidator.setValidationState(EValidationState.VALIDATION_OK));
      return;
    } else {
      yield put(actions.txValidator.setValidationState(EValidationState.IS_NOT_ACCEPTING_ETHER));
    }
  } else {
    throw error;
  }
  yield put(actions.txValidator.setValidationNotifications([]));
  // This will force the user to return from the summary screen if the final validation fails
  yield put(actions.txSender.txSenderChange());
}
