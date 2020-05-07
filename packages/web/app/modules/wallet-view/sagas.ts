import { neuTakeLatestUntil } from "../sagasUtils";
import { actions } from "../actions";


export function* loadWalletView(){

}

export function* walletViewSagas(): any {
  yield neuTakeLatestUntil(
    actions.walletView.loadWalletView,
    "@@router/LOCATION_CHANGE",
    loadWalletView,
  );
}
