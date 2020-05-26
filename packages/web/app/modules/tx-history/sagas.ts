import { fork, neuTakeLatest, put, SagaGenerator, select } from "@neufund/sagas";
import { txHistoryApi } from "@neufund/shared-modules";

import { TransactionDetailsModal } from "../../components/wallet/transactions-history/TransactionDetailsModal";
import { TGlobalDependencies } from "../../di/setupBindings";
import { TAppGlobalState } from "../../store";
import { actions, TActionFromCreator } from "../actions";

function* showTransactionDetails(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof txHistoryApi.actions.showTransactionDetails>,
): Generator<any, any, any> {
  const transaction = yield select((state: TAppGlobalState) =>
    txHistoryApi.selectors.selectTXById(action.payload.id, state),
  );

  if (!transaction) {
    throw new Error(`Transaction should be defined for ${action.payload.id}`);
  }

  yield put(
    actions.genericModal.showModal(TransactionDetailsModal, {
      transaction,
    }),
  );
}

export function setupTXHistorySagas(): () => SagaGenerator<void> {
  return function* txHistorySaga(): SagaGenerator<any, any> {
    yield fork(neuTakeLatest, txHistoryApi.actions.showTransactionDetails, showTransactionDetails);
  };
}
