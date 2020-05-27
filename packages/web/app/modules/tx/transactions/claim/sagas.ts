import { fork, put, select } from "@neufund/sagas";

import { TGlobalDependencies } from "../../../../di/setupBindings";
import { ETOCommitment } from "../../../../lib/contracts/ETOCommitment";
import { ITxData } from "../../../../lib/web3/types";
import { TAppGlobalState } from "../../../../store";
import { actions, TAction } from "../../../actions";
import { selectMyInvestorTicketByEtoId } from "../../../investor-portfolio/selectors";
import { neuCall, neuTakeLatest } from "../../../sagasUtils";
import { selectEthereumAddress } from "../../../web3/selectors";
import { txSendSaga } from "../../sender/sagas";
import { selectStandardGasPriceWithOverHead, selectTxGasCostEthUlps } from "../../sender/selectors";
import { ETxSenderType } from "../../types";

function* generateGetClaimTransaction(
  { contractsService, web3Manager }: TGlobalDependencies,
  etoId: string,
): any {
  const userAddress = yield select(selectEthereumAddress);
  const gasPriceWithOverhead = yield select(selectStandardGasPriceWithOverHead);

  const etoContract: ETOCommitment = yield contractsService.getETOCommitmentContract(etoId);
  const txInput = etoContract.claimTx().getData();

  const txInitialDetails = {
    to: etoContract.address,
    from: userAddress,
    data: txInput,
    value: "0",
    gasPrice: gasPriceWithOverhead,
  };

  const estimatedGasWithOverhead = yield web3Manager.estimateGasWithOverhead(txInitialDetails);

  const txDetails: ITxData = {
    ...txInitialDetails,
    gas: estimatedGasWithOverhead,
  };

  return txDetails;
}

function* startClaimGenerator(_: TGlobalDependencies, etoId: string): any {
  const generatedTxDetails: ITxData = yield neuCall(generateGetClaimTransaction, etoId);
  yield put(actions.txSender.setTransactionData(generatedTxDetails));

  const etoData = yield select((state: TAppGlobalState) =>
    selectMyInvestorTicketByEtoId(state, etoId),
  );
  const costUlps = yield select(selectTxGasCostEthUlps);
  const tokenDecimals = 0;

  yield put(
    actions.txSender.txSenderContinueToSummary<ETxSenderType.USER_CLAIM>({
      etoId,
      costUlps,
      tokenDecimals,
      tokenName: etoData.equityTokenName,
      tokenSymbol: etoData.equityTokenSymbol,
      tokenQuantity: etoData.investorTicket.equityTokenInt.toString(),
      neuRewardUlps: etoData.investorTicket.rewardNmkUlps.toString(),
    }),
  );
}

function* userClaimSaga(
  { logger }: TGlobalDependencies,
  action: TAction,
): Generator<any, any, any> {
  if (action.type !== "TRANSACTIONS_START_CLAIM") return;
  const etoId = action.payload;
  try {
    yield txSendSaga({
      type: ETxSenderType.USER_CLAIM,
      transactionFlowGenerator: startClaimGenerator,
      extraParam: etoId,
    });
    logger.info("User claim successful");
  } catch (e) {
    logger.info("User claim cancelled", e);
  }
}

export const txUserClaimSagas = function*(): Generator<any, any, any> {
  yield fork(neuTakeLatest, "TRANSACTIONS_START_CLAIM", userClaimSaga);
};
