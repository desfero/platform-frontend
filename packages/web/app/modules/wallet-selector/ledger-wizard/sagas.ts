import { call, fork, neuCall, put, race, select, take } from "@neufund/sagas";
import { EWalletType } from "@neufund/shared-modules";
import { toEthereumAddress } from "@neufund/shared-utils";
import { toPairs, zip } from "lodash";

import { tripleZip } from "../../../../typings/modifications";
import { userMayChooseWallet } from "../../../components/wallet-selector/WalletSelectorLogin/utils";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { LedgerUserCancelledError } from "../../../lib/web3/ledger-wallet/errors";
import { TAppGlobalState } from "../../../store";
import { actions, TActionFromCreator } from "../../actions";
import { neuTakeLatestUntil } from "../../sagasUtils";
import { isSupportingLedger } from "../../user-agent/reducer";
import { registerForm } from "../forms/sagas";
import { resetWalletSelectorState, walletSelectorConnect } from "../sagas";
import { selectRegisterWalletDefaultFormValues } from "../selectors";
import {
  ECommonWalletRegistrationFlowState,
  EFlowType,
  ELedgerRegistrationFlowState,
  TGenericWalletFormValues,
} from "../types";
import { mapLedgerErrorToErrorMessage } from "./errors";
import { ledgerUiSagas } from "./ui/sagas";

export const LEDGER_WIZARD_SIMPLE_DERIVATION_PATHS = ["44'/60'/0'/0", "44'/60'/0'/0/0"]; // TODO this should be taken from config

export function* ledgerRegister(
  _: TGlobalDependencies,
  { payload }: TActionFromCreator<typeof actions.walletSelector.registerWithLedger>,
): Generator<any, void, any> {
  yield neuCall(resetWalletSelectorState);
  const userType = payload.userType;

  const baseUiData = {
    walletType: EWalletType.LEDGER,
    showWalletSelector: userMayChooseWallet(userType),
    rootPath: "/register",
    flowType: EFlowType.REGISTER,
  };
  const initialFormValues: TGenericWalletFormValues = {
    email: "",
    tos: false,
  };
  const ledgerIsSupported = yield* select(isSupportingLedger);
  if (!ledgerIsSupported) {
    yield put(
      actions.walletSelector.setWalletRegisterData({
        uiState: ELedgerRegistrationFlowState.LEDGER_NOT_SUPPORTED,
        showWalletSelector: true,
      }),
    );
    return;
  }
  yield neuCall(registerForm, {
    afterRegistrationGenerator: undefined,
    expectedAction: actions.walletSelector.genericWalletRegisterFormData,
    initialFormValues,
    baseUiData,
  });
  yield* neuCall(ledgerLogin);
}

export function* ledgerLogin({
  ledgerWalletConnector,
  web3Manager,
}: TGlobalDependencies): Generator<any, void, any> {
  const formValues = yield* select(selectRegisterWalletDefaultFormValues);

  const ledgerIsSupported = yield* select(isSupportingLedger);
  if (!ledgerIsSupported) {
    yield put(
      actions.walletSelector.setWalletRegisterData({
        uiState: ELedgerRegistrationFlowState.LEDGER_NOT_SUPPORTED,
        showWalletSelector: true,
      }),
    );
    return;
  }

  while (true) {
    try {
      yield put(
        actions.walletSelector.setWalletRegisterData({
          uiState: ELedgerRegistrationFlowState.LEDGER_INIT,
          showWalletSelector: true,
        }),
      );

      yield ledgerWalletConnector.connect();
      yield neuCall(loadLedgerAccountsEffect);

      yield put(
        actions.walletSelector.setWalletRegisterData({
          uiState: ELedgerRegistrationFlowState.LEDGER_ACCOUNT_CHOOSER,
        }),
      );
      const { success, cancel } = yield race({
        success: take(actions.walletSelector.ledgerFinishSettingUpLedgerConnector),
        cancel: take(actions.walletSelector.ledgerCloseAccountChooser),
      });

      yield put(
        actions.walletSelector.setWalletRegisterData({
          uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
          showWalletSelector: false,
        }),
      );

      if (cancel) {
        throw new LedgerUserCancelledError();
      }

      const ledgerWallet = yield* call(
        ledgerWalletConnector.finishConnecting,
        success?.payload.derivationPath,
        web3Manager.networkId,
      );
      yield web3Manager.plugPersonalWallet(ledgerWallet);
      yield walletSelectorConnect(formValues?.email, formValues?.tos);
    } catch (e) {
      yield put(
        actions.walletSelector.setWalletRegisterData({
          errorMessage: mapLedgerErrorToErrorMessage(e),
          uiState: ELedgerRegistrationFlowState.LEDGER_INIT_ERROR,
          showWalletSelector: true,
        }),
      );
    }
    yield take(actions.walletSelector.ledgerReconnect);
  }
}

export function* loadLedgerAccountsEffect({
  ledgerWalletConnector,
  web3Manager,
  contractsService,
}: TGlobalDependencies): Generator<any, any, any> {
  const state: TAppGlobalState = yield select();
  const {
    advanced,
    index,
    numberOfAccountsPerPage,
    derivationPathPrefix,
  } = state.ledgerWizardState;
  const derivationPathToAddressMap = advanced
    ? yield ledgerWalletConnector.getMultipleAccountsFromDerivationPrefix(
        derivationPathPrefix,
        index,
        numberOfAccountsPerPage,
      )
    : yield ledgerWalletConnector.getMultipleAccounts(LEDGER_WIZARD_SIMPLE_DERIVATION_PATHS);

  const derivationPathsArray = toPairs<string>(derivationPathToAddressMap).map(pair => ({
    derivationPath: pair[0],
    address: toEthereumAddress(pair[1]),
  }));

  const balancesETH: string[] = yield Promise.all(
    derivationPathsArray.map(dp => web3Manager.getBalance(dp.address).then(bn => bn.toString())),
  );

  const balancesNEU: string[] = yield Promise.all(
    derivationPathsArray.map(dp =>
      contractsService.neumark.balanceOf(dp.address).then(bn => bn.toString()),
    ),
  );

  const accounts = (zip as tripleZip)(derivationPathsArray, balancesETH, balancesNEU).map(
    ([dp, balanceETH, balanceNEU]) => ({
      ...dp,
      balanceETH: balanceETH,
      balanceNEU: balanceNEU,
    }),
  );
  yield put(actions.walletSelector.setLedgerAccounts(accounts, derivationPathPrefix));
}

export function* loadLedgerAccounts({ logger }: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield neuCall(loadLedgerAccountsEffect);
  } catch (e) {
    logger.error("Failed to load ledger accounts", e);
    yield put(
      actions.walletSelector.ledgerConnectionEstablishedError(mapLedgerErrorToErrorMessage(e)),
    );
  }
}

export function* ledgerSagas(): Generator<any, any, any> {
  yield fork(
    neuTakeLatestUntil,
    actions.walletSelector.loginWithLedger,
    "@@router/LOCATION_CHANGE",
    ledgerLogin,
  );
  yield fork(
    neuTakeLatestUntil,
    actions.walletSelector.registerWithLedger,
    "@@router/LOCATION_CHANGE",
    ledgerRegister,
  );
  yield fork(
    neuTakeLatestUntil,
    actions.walletSelector.ledgerLoadAccounts,
    actions.walletSelector.reset,
    loadLedgerAccounts,
  );
  yield fork(ledgerUiSagas);
}
