import { all, put, select } from "@neufund/sagas";
import { invariant } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";

import { ECurrency } from "../../../../../components/shared/formatters/utils";
import { TGlobalDependencies } from "../../../../../di/setupBindings";
import { ITxData } from "../../../../../lib/web3/types";
import { actions } from "../../../../actions";
import { selectIsVerifiedInvestor } from "../../../../auth/selectors";
import { selectStandardGasPriceWithOverHead } from "../../../../gas/selectors";
import { ITokenDisbursal } from "../../../../investor-portfolio/types";
import { neuCall } from "../../../../sagasUtils";
import { getTokenAddress } from "../../../../shared/sagas";
import { selectEthereumAddress } from "../../../../web3/selectors";
import { ETxType } from "../../../types";

// Use highest possible solidity uint256 to accept all disbursals for token
// see https://github.com/Neufund/platform-contracts/blob/59e88f6881bf5adbced8462f1925496467ea4c18/contracts/FeeDisbursal/FeeDisbursal.sol#L164
const ACCEPT_ALL_DISBURSALS = new BigNumber("2").pow(256).minus("1");

function* generatePayoutAcceptSingleTokenTransaction(
  { contractsService, web3Manager }: TGlobalDependencies,
  tokenDisbursal: ITokenDisbursal,
): any {
  const userAddress = yield select(selectEthereumAddress);
  const gasPriceWithOverhead = yield select(selectStandardGasPriceWithOverHead);

  const { feeDisbursal } = contractsService;

  const txInput = feeDisbursal
    .acceptTx(
      yield neuCall(getTokenAddress, tokenDisbursal.token),
      yield neuCall(getTokenAddress, ECurrency.NEU),
      ACCEPT_ALL_DISBURSALS,
    )
    .getData();

  const txInitialDetails = {
    to: feeDisbursal.address,
    from: userAddress,
    data: txInput,
    value: "0",
    gasPrice: gasPriceWithOverhead,
  };

  const estimatedGasWithOverhead = yield web3Manager.estimateGasWithOverhead(txInitialDetails);

  return {
    ...txInitialDetails,
    gas: estimatedGasWithOverhead,
  };
}

function* generatePayoutAcceptMultipleTokenTransaction(
  { contractsService, web3Manager }: TGlobalDependencies,
  tokensDisbursal: ReadonlyArray<ITokenDisbursal>,
): any {
  const userAddress = yield select(selectEthereumAddress);
  const gasPriceWithOverhead = yield select(selectStandardGasPriceWithOverHead);

  const { feeDisbursal } = contractsService;

  const txInput = feeDisbursal
    .acceptMultipleByTokenTx(
      yield all(tokensDisbursal.map(disbursal => neuCall(getTokenAddress, disbursal.token))),
      yield neuCall(getTokenAddress, ECurrency.NEU),
    )
    .getData();

  const txInitialDetails = {
    to: feeDisbursal.address,
    from: userAddress,
    data: txInput,
    value: "0",
    gasPrice: gasPriceWithOverhead,
  };

  const estimatedGasWithOverhead = yield web3Manager.estimateGasWithOverhead(txInitialDetails);

  return {
    ...txInitialDetails,
    gas: estimatedGasWithOverhead,
  };
}

function* generatePayoutAcceptTokenTransaction(
  _: TGlobalDependencies,
  tokensDisbursals: ReadonlyArray<ITokenDisbursal>,
): any {
  const isInvestorVerified: boolean = yield select(selectIsVerifiedInvestor);

  invariant(
    isInvestorVerified,
    "Generating payout accept transactions is not allowed for unverified investor",
  );

  if (tokensDisbursals.length === 1) {
    return yield neuCall(generatePayoutAcceptSingleTokenTransaction, tokensDisbursals[0]);
  } else {
    return yield neuCall(generatePayoutAcceptMultipleTokenTransaction, tokensDisbursals);
  }
}

export function* startInvestorPayoutAcceptGenerator(
  _: TGlobalDependencies,
  tokensDisbursals: ReadonlyArray<ITokenDisbursal>,
): any {
  const generatedTxDetails: ITxData = yield neuCall(
    generatePayoutAcceptTokenTransaction,
    tokensDisbursals,
  );
  yield put(actions.txSender.setTransactionData(generatedTxDetails));
  yield put(
    actions.txSender.txSenderContinueToSummary<ETxType.INVESTOR_ACCEPT_PAYOUT>({
      tokensDisbursals,
    }),
  );
}
