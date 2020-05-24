import { fork, neuCall, put, select } from "@neufund/sagas";
import { EWalletType } from "@neufund/shared-modules";

import { BrowserWalletErrorMessage } from "../../../components/translatedMessages/messages";
import { userMayChooseWallet } from "../../../components/wallet-selector/WalletSelectorLogin/utils";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { BrowserWallet } from "../../../lib/web3/browser-wallet/BrowserWallet";
import { actions, TActionFromCreator } from "../../actions";
import { signInUser } from "../../auth/user/sagas";
import { neuTakeLatestUntil, neuTakeUntil } from "../../sagasUtils";
import { registerForm } from "../forms/sagas";
import { resetWalletSelectorState } from "../sagas";
import { selectRegisterWalletDefaultFormValues, selectUrlUserType } from "../selectors";
import {
  EBrowserWalletRegistrationFlowState,
  ECommonWalletRegistrationFlowState,
  EFlowType,
  TGenericWalletFormValues,
} from "../types";
import { mapBrowserWalletErrorToErrorMessage } from "./errors";

/**
 * @generator connects a browser wallet and signs in the user once the browser wallet is connected
 */
export function* browserWalletConnectAndSign({
  browserWalletConnector,
  web3Manager,
  logger,
}: TGlobalDependencies): Generator<any, void, any> {
  const initialFormValues = yield* select(selectRegisterWalletDefaultFormValues);
  try {
    const userType = yield* select(selectUrlUserType);

    yield put(
      actions.walletSelector.setWalletRegisterData({
        uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
        showWalletSelector: false,
      }),
    );
    const browserWallet: BrowserWallet = yield browserWalletConnector.connect(
      web3Manager.networkId,
    );

    yield web3Manager.plugPersonalWallet(browserWallet);
    yield neuCall(signInUser, {
      userType,
      email: initialFormValues?.email,
      tos: initialFormValues?.tos,
    });
  } catch (e) {
    const errorMessage = mapBrowserWalletErrorToErrorMessage(e);
    if (errorMessage.messageType === BrowserWalletErrorMessage.GENERIC_ERROR) {
      logger.error("Error while trying to connect with browser wallet", e);
    }
    yield put(
      actions.walletSelector.setWalletRegisterData({
        uiState: EBrowserWalletRegistrationFlowState.BROWSER_WALLET_ERROR,
        showWalletSelector: true,
        errorMessage,
      }),
    );
  }
}

export function* browserWalletRegister(
  _: TGlobalDependencies,
  { payload }: TActionFromCreator<typeof actions.walletSelector.registerWithBrowserWallet>,
): Generator<any, void, any> {
  const userType = payload.userType;

  const baseUiData = {
    walletType: EWalletType.BROWSER,
    showWalletSelector: userMayChooseWallet(userType),
    rootPath: "/register",
    flowType: EFlowType.REGISTER,
  };
  const initialFormValues: TGenericWalletFormValues = {
    email: "",
    tos: false,
  };
  yield neuCall(resetWalletSelectorState);
  yield neuCall(registerForm, {
    afterRegistrationGenerator: function*(): Generator<any, boolean, any> {
      yield neuCall(browserWalletConnectAndSign);
      return true;
    },
    expectedAction: actions.walletSelector.genericWalletRegisterFormData,
    initialFormValues,
    baseUiData,
  });
}

export function* browserWalletSagas(): Generator<any, any, any> {
  yield fork(
    neuTakeLatestUntil,
    actions.walletSelector.registerWithBrowserWallet,
    "@@router/LOCATION_CHANGE",
    browserWalletRegister,
  );

  yield fork(
    neuTakeUntil,
    actions.walletSelector.browserWalletSignMessage,
    "@@router/LOCATION_CHANGE",
    browserWalletConnectAndSign,
  );
}
