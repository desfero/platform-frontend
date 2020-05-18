import { EUserType } from "@neufund/shared-modules";
import { createActionFactory } from "@neufund/shared-utils";

import { TMessage } from "../../components/translatedMessages/utils";
import { browserWizardActions } from "./browser-wizard/actions";
import { ledgerWizardActions } from "./ledger-wizard/actions";
import { lightWizardActions } from "./light-wizard/actions";
import { TWalletRegisterData } from "./types";
import { walletConnectActions } from "./wallet-connect/actions";

const actions = {
  reset: createActionFactory("WALLET_SELECTOR_RESET"),
  messageSigning: createActionFactory("WALLET_SELECTOR_MESSAGE_SIGNING"),
  messageSigningError: createActionFactory(
    "WALLET_SELECTOR_MESSAGE_SIGNING_ERROR",
    (errorMessage: TMessage) => ({ errorMessage }),
  ),
  registerWithBrowserWallet: createActionFactory(
    "REGISTER_WITH_BROWSER_WALLET",
    (userType: EUserType) => ({ userType }),
  ),
  registerWithLightWallet: createActionFactory(
    "REGISTER_WITH_LIGHT_WALLET",
    (userType: EUserType) => ({ userType }),
  ),
  registerWithLedger: createActionFactory("REGISTER_WITH_LEDGER", (userType: EUserType) => ({
    userType,
  })),
  loginWithLedger: createActionFactory("LOGIN_WITH_LEDGER"),
  setWalletRegisterData: createActionFactory(
    "SET_WALLET_REGISTER_DATA",
    (data: TWalletRegisterData) => ({ data } as const),
  ),
  genericWalletRegisterFormData: createActionFactory(
    "GENERIC_WALLET_REGISTER_FORM_DATA",
    (email: string, tos: boolean) => ({ email, tos }),
  ),
  browserWalletSignMessage: createActionFactory("BROWSER_WALLET_SIGN_MESSAGE"),
  ledgerReconnect: createActionFactory("LEDGER_RECONNECT"),
  lightWalletRegisterFormData: createActionFactory(
    "LIGHT_WALLET_REGISTER_FORM_DATA",
    (email: string, password: string, tos: boolean) => ({
      email,
      password,
      tos,
    }),
  ),
  ledgerCloseAccountChooser: createActionFactory("LEDGER_CLOSE_ACCOUNT_CHOOSER"),
  restoreLightWallet: createActionFactory("RESTORE_LIGHT_WALLET"),
  submitSeed: createActionFactory("SUBMIT_SEED", (seed: string) => ({ seed })),
};

export const walletSelectorActions = {
  ...browserWizardActions,
  ...ledgerWizardActions,
  ...lightWizardActions,
  ...walletConnectActions,
  ...actions,
};
