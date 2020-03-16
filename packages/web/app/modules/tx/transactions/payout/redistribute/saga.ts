import { put, select, take } from "@neufund/sagas";
import { ECurrency, invariant } from "@neufund/shared";
import BigNumber from "bignumber.js";

import { TGlobalDependencies } from "../../../../../di/setupBindings";
import { ITxData } from "../../../../../lib/web3/types";
import { actions } from "../../../../actions";
import { selectIsVerifiedInvestor } from "../../../../auth/selectors";
import { selectStandardGasPriceWithOverHead } from "../../../../gas/selectors";
import { ITokenDisbursal } from "../../../../investor-portfolio/types";
import { neuCall } from "../../../../sagasUtils";
import { getTokenAddress } from "../../../../shared/sagas";
import { selectEthereumAddressWithChecksum } from "../../../../web3/selectors";
import { ETxSenderType } from "../../../types";

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

  const userAddress = yield select(selectEthereumAddressWithChecksum);
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
    actions.txSender.txSenderContinueToSummary<ETxSenderType.INVESTOR_REDISTRIBUTE_PAYOUT>({
      tokenDisbursals,
    }),
  );
}
