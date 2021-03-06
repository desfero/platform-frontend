import { createActionFactory } from "@neufund/shared-utils";

import { TMessage } from "../../../components/translatedMessages/utils";
import { ERecoveryPhase } from "./reducer";

export const lightWizardActions = {
  lightWalletConnectionError: createActionFactory(
    "LIGHT_WALLET_CONNECTION_ERROR",
    (errorMsg: TMessage) => ({ errorMsg }),
  ),
  lightWalletLogin: createActionFactory(
    "LIGHT_WALLET_LOGIN",
    (email: string, password: string) => ({ email, password }),
  ),
  lightWalletRecover: createActionFactory(
    "LIGHT_WALLET_RECOVER",
    (email: string, password: string, seed: string) => ({ email, password, seed }),
  ),
  lightWalletBackedUp: createActionFactory("LIGHT_WALLET_BACKUP"),
  lightWalletRegister: createActionFactory(
    "LIGHT_WALLET_REGISTER",
    (email: string, password: string) => ({ email, password }),
  ),
  setRecoveryPhase: createActionFactory(
    "SET_LIGHT_WALLET_RECOVERY_PHASE",
    (RecoveryPhase: ERecoveryPhase) => ({
      RecoveryPhase,
    }),
  ),
};
