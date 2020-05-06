import { fork, put } from "@neufund/sagas";

import { TGlobalDependencies } from "../../../../di/setupBindings";
import { actions, TActionFromCreator } from "../../../actions";
import { neuTakeLatest } from "../../../sagasUtils";
import { txSendSaga } from "../../sender/sagas";
import { ETxType } from "../../types";
import { startInvestorPayoutAcceptGenerator } from "../payout/accept/saga";
import { startInvestorPayoutRedistributionGenerator } from "../payout/redistribute/saga";

function* investorPayoutRedistributeSaga(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.txTransactions.startInvestorPayoutRedistribute>,
): Generator<any, any, any> {
  const tokenDisbursals = action.payload.tokenDisbursals;

  try {
    yield txSendSaga({
      type: ETxType.INVESTOR_REDISTRIBUTE_PAYOUT,
      transactionFlowGenerator: startInvestorPayoutRedistributionGenerator,
      extraParam: tokenDisbursals,
    });

    logger.info("Investor payout redistribution successful");
  } catch (e) {
    logger.info("Investor payout redistribution cancelled", e);
  } finally {
    yield put(actions.investorEtoTicket.loadClaimables());
  }
}

function* investorPayoutAcceptSaga(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.txTransactions.startInvestorPayoutAccept>,
): Generator<any, any, any> {
  const tokensDisbursals = action.payload.tokensDisbursals;

  try {
    yield txSendSaga({
      type: ETxType.INVESTOR_ACCEPT_PAYOUT,
      transactionFlowGenerator: startInvestorPayoutAcceptGenerator,
      extraParam: tokensDisbursals,
    });

    logger.info("Investor payout accept successful");
  } catch (e) {
    logger.info("Investor payout accept cancelled", e);
  } finally {
    yield put(actions.investorEtoTicket.loadClaimables());
  }
}

export const txPayoutSagas = function*(): Generator<any, any, any> {
  yield fork(
    neuTakeLatest,
    actions.txTransactions.startInvestorPayoutAccept,
    investorPayoutAcceptSaga,
  );
  yield fork(
    neuTakeLatest,
    actions.txTransactions.startInvestorPayoutRedistribute,
    investorPayoutRedistributeSaga,
  );
};
