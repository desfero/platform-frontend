import { DeepReadonly } from "@neufund/shared-utils";

import { TMessage } from "../../components/translatedMessages/utils";
import { EWalletType } from "../web3/types";

export enum EFlowType {
  REGISTER = "register",
  RESTORE_WALLET = "restoreWallet",
  IMPORT_WALLET = "importWallet",
  LOGIN = "login", //not used yet
}

export enum EBrowserWalletRegistrationFlowState {
  BROWSER_WALLET_ERROR = "browserWalletError",
}

export enum ELightWalletRegistrationFlowState {
  LIGHT_WALLET_SIGNING = "lightWalletSigning",
  LIGHT_WALLET_ERROR = "lightWalletError",
}

export enum ELedgerRegistrationFlowState {
  LEDGER_NOT_SUPPORTED = "ledgerNotSupported",
  LEDGER_INIT = "ledgerInit",
  LEDGER_INIT_ERROR = "ledgerInitError",
  LEDGER_ACCOUNT_CHOOSER = "ledgerAccountChooser",
}

export enum ECommonWalletRegistrationFlowState {
  NOT_STARTED = "walletFlowNotStarted",
  REGISTRATION_FORM = "registrationForm",
  REGISTRATION_VERIFYING_EMAIL = "registrationVerifyingEmail",
  REGISTRATION_EMAIL_VERIFICATION_ERROR = "registrationEmailVerificationError",
  REGISTRATION_WALLET_LOADING = "REGISTRATION_WALLET_LOADING",
  REGISTRATION_WALLET_SIGNING = "REGISTRATION_WALLET_SIGNING",
}

export type TGenericWalletFormValues = {
  tos: boolean;
  email: string;
};

export type TLightWalletFormValues = {
  password: string;
  repeatPassword: string;
} & TGenericWalletFormValues;

// TODO: Setup the types in a way where only
export type TCommonWalletRegisterData = {
  showWalletSelector?: boolean | undefined;
  initialFormValues?: TGenericWalletFormValues | TLightWalletFormValues;
};

export type TBrowserWalletRegisterData = TCommonWalletRegisterData &
  (
    | { uiState: EBrowserWalletRegistrationFlowState.BROWSER_WALLET_ERROR; errorMessage: TMessage }
    | { uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_LOADING }
    | { uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING }
    | { uiState: ECommonWalletRegistrationFlowState.REGISTRATION_FORM }
    | { uiState: ECommonWalletRegistrationFlowState.REGISTRATION_VERIFYING_EMAIL }
    | {
        uiState: ECommonWalletRegistrationFlowState.REGISTRATION_EMAIL_VERIFICATION_ERROR;
        errorMessage: TMessage;
      }
  );

export type TLightWalletRegisterData = TCommonWalletRegisterData &
  (
    | { uiState: ELightWalletRegistrationFlowState.LIGHT_WALLET_ERROR; errorMessage: TMessage }
    | { uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_LOADING }
    | { uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING }
    | { uiState: ECommonWalletRegistrationFlowState.REGISTRATION_FORM }
    | { uiState: ECommonWalletRegistrationFlowState.REGISTRATION_VERIFYING_EMAIL }
    | {
        uiState: ECommonWalletRegistrationFlowState.REGISTRATION_EMAIL_VERIFICATION_ERROR;
        errorMessage: TMessage;
      }
  );

export type TLedgerRegisterData = TCommonWalletRegisterData &
  (
    | { uiState: ELedgerRegistrationFlowState.LEDGER_NOT_SUPPORTED }
    | { uiState: ELedgerRegistrationFlowState.LEDGER_INIT }
    | { uiState: ELedgerRegistrationFlowState.LEDGER_INIT_ERROR; errorMessage: TMessage }
    | { uiState: ELedgerRegistrationFlowState.LEDGER_ACCOUNT_CHOOSER }
    | { uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_LOADING }
    | { uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING }
    | { uiState: ECommonWalletRegistrationFlowState.REGISTRATION_FORM }
    | { uiState: ECommonWalletRegistrationFlowState.REGISTRATION_VERIFYING_EMAIL }
    | {
        uiState: ECommonWalletRegistrationFlowState.REGISTRATION_EMAIL_VERIFICATION_ERROR;
        errorMessage: TMessage;
      }
  );

export type TInitialRegisterData = {
  uiState: ECommonWalletRegistrationFlowState.NOT_STARTED;
};

export type TWalletRegisterData =
  | TInitialRegisterData
  | TLightWalletRegisterData
  | TBrowserWalletRegisterData
  | TLedgerRegisterData;

export type TWalletSelectorState = {
  walletType: EWalletType;
  flowType: EFlowType;

  //backwards compatibility only
  isMessageSigning: boolean;
  messageSigningError: DeepReadonly<TMessage> | undefined;
  walletConnectError: DeepReadonly<TMessage> | undefined;
  isLoading: boolean;
};
