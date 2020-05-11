import { DeepReadonly } from "@neufund/shared-utils";

import { TMessage } from "../../../components/translatedMessages/utils";
import { AppReducer, TAppGlobalState } from "../../../store";
import { actions } from "../../actions";
import { DEFAULT_DERIVATION_PATH_PREFIX, DEFAULT_LEDGER_ACCOUNTS_PER_PAGE } from "./constants";

export interface ILedgerAccount {
  address: string;
  derivationPath: string;
  balanceETH: string;
  balanceNEU: string;
}

export interface ILedgerWizardState {
  isInitialConnectionInProgress: boolean;
  isConnectionEstablished: boolean;
  errorMsg?: TMessage;
  isLoading: boolean;
  derivationPathPrefix: string; // TODO: it can be optional, not required for advanced - false
  index: number; // TODO: it can be optional, not required for advanced - false
  numberOfAccountsPerPage: number; // TODO: it can be optional, not required for advanced - false
  accounts: ILedgerAccount[];
  advanced: boolean;
}

export const ledgerWizardInitialState: ILedgerWizardState = {
  isInitialConnectionInProgress: true,
  isConnectionEstablished: false,
  isLoading: false,
  derivationPathPrefix: DEFAULT_DERIVATION_PATH_PREFIX,
  index: 0,
  numberOfAccountsPerPage: DEFAULT_LEDGER_ACCOUNTS_PER_PAGE,
  accounts: [],
  advanced: false,
};

export const ledgerWizardReducer: AppReducer<ILedgerWizardState> = (
  state = ledgerWizardInitialState,
  action,
): DeepReadonly<ILedgerWizardState> => {
  switch (action.type) {
    case actions.walletSelector.ledgerLoadAccounts.getType():
    case actions.walletSelector.ledgerFinishSettingUpLedgerConnector.getType():
      return {
        ...state,
        isLoading: true,
      };
    case actions.walletSelector.ledgerConnectionEstablishedError.getType():
      return {
        ...state,
        isInitialConnectionInProgress: false,
        isConnectionEstablished: false,
        isLoading: false,
        errorMsg: action.payload.errorMsg,
      };
    case actions.walletSelector.ledgerWizardAccountsListNextPage.getType():
      return {
        ...state,
        index: state.index + 1,
        accounts: [],
        isLoading: true,
        isInitialConnectionInProgress: false,
      };
    case actions.walletSelector.ledgerWizardAccountsListPreviousPage.getType():
      return {
        ...state,
        index: state.index === 0 ? state.index : state.index - 1,
        accounts: [],
        isLoading: true,
      };
    case actions.walletSelector.setLedgerAccounts.getType(): {
      // There is a possibility of race condition in the app when we get account lists from ledger which is async
      // operation. That's why we need to check if list that was received matches derivation path prefix that is
      // currently set.
      if (!state.advanced || state.derivationPathPrefix === action.payload.derivationPathPrefix) {
        return {
          ...state,
          accounts: action.payload.accounts,
          isLoading: false,
          isInitialConnectionInProgress: false,
        };
      }
      break;
    }
    case actions.walletSelector.setLedgerWizardDerivationPathPrefix.getType():
      return {
        ...state,
        errorMsg: undefined,
        derivationPathPrefix: action.payload.derivationPathPrefix,
        index: 0,
        accounts: [],
        isLoading: true,
        isInitialConnectionInProgress: false,
      };
    case actions.walletSelector.toggleLedgerAccountsAdvanced.getType():
      return {
        ...state,
        isLoading: true,
        advanced: !state.advanced,
      };
    case actions.walletSelector.ledgerCloseAccountChooser.getType():
      return ledgerWizardInitialState;
  }

  return state;
};

export function selectHasPreviousPage(state: DeepReadonly<ILedgerWizardState>): boolean {
  return state.index > 0;
}

export const selectLedgerWizardError = (state: TAppGlobalState) => state.ledgerWizardState.errorMsg;
