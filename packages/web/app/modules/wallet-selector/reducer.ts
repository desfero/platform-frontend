import { EWalletType } from "@neufund/shared-modules";

import { AppReducer } from "../../store";
import { actions } from "../actions";
import {
  ECommonWalletRegistrationFlowState,
  EFlowType,
  TWalletRegisterData,
  TWalletSelectorState,
} from "./types";

export const walletSelectorInitialState: TWalletSelectorState & TWalletRegisterData = {
  isMessageSigning: false,
  messageSigningError: undefined,
  walletConnectError: undefined,
  isLoading: false,

  walletType: EWalletType.LIGHT,
  uiState: ECommonWalletRegistrationFlowState.NOT_STARTED,
  flowType: EFlowType.REGISTER, //todo remove those values
};

// TODO merge error fields, make one enum for all signer/wallet related errors
export const walletSelectorReducer: AppReducer<TWalletSelectorState & TWalletRegisterData> = (
  state = walletSelectorInitialState,
  action,
): TWalletSelectorState & TWalletRegisterData => {
  switch (action.type) {
    //backwards compatibility only
    case actions.walletSelector.tryConnectingWithBrowserWallet.getType():
      return {
        ...walletSelectorInitialState,
        isLoading: true,
      };
    //backwards compatibility only
    case actions.walletSelector.messageSigning.getType():
      return {
        flowType: state.flowType,
        isMessageSigning: true,
        messageSigningError: undefined,
        walletConnectError: undefined,
        isLoading: false,
        walletType: state.walletType,
        uiState: ECommonWalletRegistrationFlowState.NOT_STARTED,
      };
    //backwards compatibility only
    case actions.walletSelector.browserWalletConnectionError.getType():
      return {
        flowType: state.flowType,
        isMessageSigning: false,
        messageSigningError: action.payload.errorMsg,
        walletConnectError: undefined,
        isLoading: false,
        walletType: state.walletType,
        uiState: ECommonWalletRegistrationFlowState.NOT_STARTED,
      };
    //backwards compatibility only
    case actions.walletSelector.messageSigningError.getType():
      return {
        ...state,
        isMessageSigning: false,
        messageSigningError: action.payload.errorMessage,
        isLoading: false,
      };
    //backwards compatibility only
    case actions.walletSelector.reset.getType():
      return {
        ...walletSelectorInitialState,
      };
    case actions.walletSelector.setWalletRegisterData.getType():
      return {
        ...state,
        ...action.payload.data,
      };
    case actions.walletSelector.walletConnectError.getType():
      return {
        ...state,
        isMessageSigning: false,
        messageSigningError: undefined,
        walletConnectError: action.payload.error,
      };
  }

  return state;
};
