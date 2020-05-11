import { fork, neuTakeEvery, put, select } from "@neufund/sagas";

import { TGlobalDependencies } from "../../../../di/setupBindings";
import { TAppGlobalState } from "../../../../store";
import { actions, TAction } from "../../../actions";

export function* setDerivationPathPrefix(_: TGlobalDependencies, action: TAction): any {
  if (action.type !== actions.walletSelector.ledgerSetDerivationPathPrefix.getType()) return;
  const state: TAppGlobalState = yield select();
  const currDp = state.ledgerWizardState.derivationPathPrefix;
  const { derivationPathPrefix } = action.payload;
  if (currDp !== derivationPathPrefix) {
    yield put(actions.walletSelector.setLedgerWizardDerivationPathPrefix(derivationPathPrefix));
    yield put(actions.walletSelector.ledgerLoadAccounts());
  }
}

export function* goToNextPageAndLoadData(): any {
  yield put(actions.walletSelector.ledgerWizardAccountsListNextPage());
  yield put(actions.walletSelector.ledgerLoadAccounts());
}

export function* goToPreviousPageAndLoadData(): any {
  yield put(actions.walletSelector.ledgerWizardAccountsListPreviousPage());
  yield put(actions.walletSelector.ledgerLoadAccounts());
}

export function* ledgerUiSagas(): Generator<any, void, any> {
  yield fork(
    neuTakeEvery,
    actions.walletSelector.ledgerSetDerivationPathPrefix.getType(),
    setDerivationPathPrefix,
  );
  yield fork(
    neuTakeEvery,
    actions.walletSelector.ledgerGoToNextPageAndLoadData.getType(),
    goToNextPageAndLoadData,
  );
  yield fork(
    neuTakeEvery,
    actions.walletSelector.ledgerGoToPreviousPageAndLoadData.getType(),
    goToPreviousPageAndLoadData,
  );
}
