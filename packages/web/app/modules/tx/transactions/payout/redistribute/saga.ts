import { put, select, take } from "@neufund/sagas";
import { invariant } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";

import { ECurrency } from "../../../../../components/shared/formatters/utils";
import { TGlobalDependencies } from "../../../../../di/setupBindings";
import { ETxType, ITxData } from "../../../../../lib/web3/types";
import { actions } from "../../../../actions";
import { selectIsVerifiedInvestor } from "../../../../auth/selectors";
import { selectStandardGasPriceWithOverHead } from "../../../../gas/selectors";
import { ITokenDisbursal } from "../../../../investor-portfolio/types";
import { neuCall } from "../../../../sagasUtils";
import { getTokenAddress } from "../../../../shared/sagas";
import { selectEthereumAddress } from "../../../../web3/selectors";

// Use highest possible solidity uint256 to redistribute all disbursals for token
// see https://github.com/Neufund/platform-contracts/blob/59e88f6881bf5adbced8462f1925496467ea4c18/contracts/FeeDisbursal/FeeDisbursal.sol#L164
const REDISTRIBUTE_ALL_DISBURSALS = new BigNumber("2").pow(256).minus("1");

function* generatePayoutRedistributeTransaction(
  { contractsService, web3Manager }: TGlobalDependencies,
  tokenDisbursal: ITokenDisbursal,
): any {
  const isInvestorVerified: boolean = yield select(selectIsVerifiedInvestor);

  invariant(
    isInvestorVerified,
    "Generating payout redistribution transactions is not allowed for unverified investor",
  );

  const userAddress = yield select(selectEthereumAddress);
  const gasPriceWithOverhead = yield select(selectStandardGasPriceWithOverHead);

  const { feeDisbursal } = contractsService;

  const txInput = feeDisbursal
    .rejectTx(
      yield neuCall(getTokenAddress, tokenDisbursal.token),
      yield neuCall(getTokenAddress, ECurrency.NEU),
      REDISTRIBUTE_ALL_DISBURSALS,
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

export function* startInvestorPayoutRedistributionGenerator(
  _: TGlobalDependencies,
  tokenDisbursals: ITokenDisbursal,
): any {
  // Wait for redistribute confirmation
  yield take(actions.txSender.txSenderAcceptDraft);

  const generatedTxDetails: ITxData = yield neuCall(
    generatePayoutRedistributeTransaction,
    tokenDisbursals,
  );
  yield put(actions.txSender.setTransactionData(generatedTxDetails));
  yield put(
    actions.txSender.txSenderContinueToSummary<ETxType.INVESTOR_REDISTRIBUTE_PAYOUT>({
      tokenDisbursals,
    }),
  );
}
