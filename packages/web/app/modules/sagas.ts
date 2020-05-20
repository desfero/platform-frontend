import { all, call, fork, getContext, neuTakeLatest, neuTakeUntil } from "@neufund/sagas";

import { TGlobalDependencies } from "../di/setupBindings";
import { actions } from "./actions";
import { authSagas } from "./auth/sagas";
import { bankTransferFlowSaga } from "./bank-transfer-flow/sagas";
import { bookBuildingFlowSagas } from "./bookbuilding-flow/sagas";
import { etoDocumentsSagas } from "./eto-documents/sagas";
import { etoFlowSagas } from "./eto-flow/sagas";
import { etoNomineeSagas } from "./eto-nominee/sagas";
import { etoViewSagas } from "./eto-view/shared/sagas";
import { etoSagas } from "./eto/sagas";
import { gasApiSagas } from "./gas/sagas";
import { icbmWalletGetDataSagas } from "./icbm-wallet-balance-modal/sagas";
import { immutableFileSagas } from "./immutable-file/sagas";
import { initSagas } from "./init/sagas";
import { investmentFlowSagas } from "./investment-flow/sagas";
import { investorTicketsSagas } from "./investor-portfolio/sagas";
import { kycSagas } from "./kyc/sagas";
import { marketingUnsubscribeView } from "./marketing-unsubscribe-view/sagas";
import { nomineeFlowSagas } from "./nominee-flow/sagas";
import { notificationModalSagas } from "./notification-modal/sagas";
import { profileSagas } from "./profile/sagas";
import { routingSagas } from "./routing/sagas";
import { formSingleFileUploadSagas } from "./shared/formSingleFileUpload/sagas";
import { remoteFileSagas } from "./shared/remoteFile/sagas";
import { termsOfServiceSagas } from "./terms-of-service/sagas";
import { txMonitorSagas } from "./tx/monitor/sagas";
import { txSenderSagasWatcher } from "./tx/sender/sagas";
import { txTransactionsSagasWatcher } from "./tx/transactions/sagas";
import { txUserFlowSagasWatcher } from "./tx/user-flow/sagas";
import { txValidatorSagasWatcher } from "./tx/validator/sagas";
import { browserWalletSagas } from "./wallet-selector/browser-wizard/sagas";
import { ledgerSagas } from "./wallet-selector/ledger-wizard/sagas";
import { lightWalletSagas } from "./wallet-selector/light-wizard/sagas";
import { walletSelectorSagas } from "./wallet-selector/sagas";
import { walletConnectSagas } from "./wallet-selector/wallet-connect/sagas";
import { walletViewSagas } from "./wallet-view/sagas";
import { walletSagas } from "./wallet/sagas";
import { web3Sagas } from "./web3/sagas";

/**
 * Restart all sagas on error and report error to sentry
 */
function* allSagas(): Generator<any, any, any> {
  yield all([
    // Sagas that should keep running even after logout
    fork(initSagas),
    fork(routingSagas),

    // Sagas that should be started on initial app load
    fork(neuTakeLatest, actions.init.startServices, authSagas),
    fork(neuTakeLatest, actions.init.startServices, walletSelectorSagas),
    fork(neuTakeLatest, actions.init.startServices, lightWalletSagas),
    fork(neuTakeLatest, actions.init.startServices, walletConnectSagas),
    fork(neuTakeLatest, actions.init.startServices, browserWalletSagas),
    fork(neuTakeLatest, actions.init.startServices, ledgerSagas),
    fork(neuTakeLatest, actions.init.startServices, notificationModalSagas),

    // Sagas that should be restarted after logout
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      termsOfServiceSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      bankTransferFlowSaga,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      txSenderSagasWatcher,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      txUserFlowSagasWatcher,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      kycSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      investorTicketsSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      profileSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      web3Sagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      walletSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      icbmWalletGetDataSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      etoFlowSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      etoViewSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      immutableFileSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      etoSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      etoNomineeSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      bookBuildingFlowSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      formSingleFileUploadSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      remoteFileSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      txValidatorSagasWatcher,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      txTransactionsSagasWatcher,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      gasApiSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      etoDocumentsSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      txMonitorSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      investmentFlowSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      nomineeFlowSagas,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      marketingUnsubscribeView,
    ),
    fork(
      neuTakeUntil,
      [actions.init.startServices, actions.init.restartServices],
      actions.init.stopServices,
      walletViewSagas,
    ),
  ]);
}

function* handleRootError(error: Error): Generator<any, any, any> {
  const { logger }: TGlobalDependencies = yield getContext("deps");

  logger.error(error);
}

export function* rootSaga(): Generator<any, any, any> {
  while (true) {
    try {
      yield call(allSagas);
    } catch (e) {
      yield call(handleRootError, e);
    }
  }
}
