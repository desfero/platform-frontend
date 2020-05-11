import { createActionFactory } from "@neufund/shared-utils";

import { TMessage } from "../../../components/translatedMessages/utils";
import { ILedgerAccount } from "./reducer";

export const ledgerWizardActions = {
  ledgerLoadAccounts: createActionFactory("LEDGER_LOAD_ACCOUNTS"),

  ledgerSetDerivationPathPrefix: createActionFactory(
    "LEDGER_SET_DERIVATION_PATH_PREFIX",
    (derivationPathPrefix: string) => ({ derivationPathPrefix }),
  ),

  ledgerGoToNextPageAndLoadData: createActionFactory("LEDGER_GO_TO_NEXT_PAGE_AND_LOAD_DATA"),

  ledgerGoToPreviousPageAndLoadData: createActionFactory(
    "LEDGER_GO_TO_PREVIOUS_PAGE_AND_LOAD_DATA",
  ),

  ledgerFinishSettingUpLedgerConnector: createActionFactory(
    "LEDGER_FINISH_SETTING_UP_LEDGER_CONNECTOR",
    (derivationPath: string) => ({ derivationPath }),
  ),

  ledgerWizardAccountsListNextPage: createActionFactory("LEDGER_WIZARD_ACCOUNTS_LIST_NEXT_PAGE"),

  ledgerWizardAccountsListPreviousPage: createActionFactory(
    "LEDGER_WIZARD_ACCOUNTS_LIST_PREVIOUS_PAGE",
  ),

  ledgerConnectionEstablishedError: createActionFactory(
    "LEDGER_CONNECTION_ESTABLISHED_ERROR",
    (errorMsg: TMessage) => ({ errorMsg }),
  ),

  setLedgerWizardDerivationPathPrefix: createActionFactory(
    "SET_LEDGER_WIZARD_DERIVATION_PATH_PREFIX",
    (derivationPathPrefix: string) => ({ derivationPathPrefix }),
  ),

  toggleLedgerAccountsAdvanced: createActionFactory("TOGGLE_LEDGER_WIZARD_ADVANCED"),

  setLedgerAccounts: createActionFactory(
    "SET_LEDGER_WIZARD_ACCOUNTS",
    (accounts: ILedgerAccount[], derivationPathPrefix: string) => ({
      accounts,
      derivationPathPrefix,
    }),
  ),
};
