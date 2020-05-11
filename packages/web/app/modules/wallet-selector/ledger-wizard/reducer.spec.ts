import { expect } from "chai";

import { LedgerErrorMessage } from "../../../components/translatedMessages/messages";
import { createMessage } from "../../../components/translatedMessages/utils";
import { actions } from "../../actions";
import { DEFAULT_DERIVATION_PATH_PREFIX, DEFAULT_LEDGER_ACCOUNTS_PER_PAGE } from "./constants";
import { ILedgerWizardState, ledgerWizardInitialState, ledgerWizardReducer } from "./reducer";

describe("Wallet selector > Ledger wizard > reducer", () => {
  it("should act on LOAD_ACCOUNTS action", () => {
    const state: ILedgerWizardState = {
      isInitialConnectionInProgress: false,
      isConnectionEstablished: true,
      accounts: [],
      derivationPathPrefix: DEFAULT_DERIVATION_PATH_PREFIX,
      index: 1,
      isLoading: false,
      numberOfAccountsPerPage: DEFAULT_LEDGER_ACCOUNTS_PER_PAGE,
      advanced: false,
    };

    const newState = ledgerWizardReducer(state, actions.walletSelector.ledgerLoadAccounts());

    expect(newState).to.be.deep.eq({
      ...state,
      isLoading: true,
    });
  });

  it("should act on LEDGER_WIZARD_ACCOUNTS_LIST_NEXT_PAGE action", () => {
    const newState = ledgerWizardReducer(
      ledgerWizardInitialState,
      actions.walletSelector.ledgerWizardAccountsListNextPage(),
    );

    expect(newState).to.be.deep.eq({
      isInitialConnectionInProgress: false,
      isConnectionEstablished: false,
      accounts: [],
      derivationPathPrefix: DEFAULT_DERIVATION_PATH_PREFIX,
      index: 1,
      isLoading: true,
      numberOfAccountsPerPage: DEFAULT_LEDGER_ACCOUNTS_PER_PAGE,
      advanced: false,
    });
  });

  it("should act on LEDGER_WIZARD_ACCOUNTS_LIST_PREVIOUS_PAGE action", () => {
    const state: ILedgerWizardState = {
      isInitialConnectionInProgress: false,
      isConnectionEstablished: true,
      accounts: [],
      derivationPathPrefix: DEFAULT_DERIVATION_PATH_PREFIX,
      index: 1,
      isLoading: true,
      numberOfAccountsPerPage: DEFAULT_LEDGER_ACCOUNTS_PER_PAGE,
      advanced: false,
    };

    const newState = ledgerWizardReducer(
      state,
      actions.walletSelector.ledgerWizardAccountsListPreviousPage(),
    );

    expect(newState).to.be.deep.eq({
      isInitialConnectionInProgress: false,
      isConnectionEstablished: true,
      accounts: [],
      derivationPathPrefix: DEFAULT_DERIVATION_PATH_PREFIX,
      index: 0,
      isLoading: true,
      numberOfAccountsPerPage: DEFAULT_LEDGER_ACCOUNTS_PER_PAGE,
      advanced: false,
    });
  });

  it("should do nothing on LEDGER_WIZARD_ACCOUNTS_LIST_PREVIOUS_PAGE action when its first page", () => {
    const state: ILedgerWizardState = {
      isInitialConnectionInProgress: false,
      isConnectionEstablished: true,
      accounts: [],
      derivationPathPrefix: DEFAULT_DERIVATION_PATH_PREFIX,
      index: 0,
      isLoading: true,
      numberOfAccountsPerPage: DEFAULT_LEDGER_ACCOUNTS_PER_PAGE,
      advanced: false,
    };

    const newState = ledgerWizardReducer(
      state,
      actions.walletSelector.ledgerWizardAccountsListPreviousPage(),
    );

    expect(newState).to.be.deep.eq({
      isInitialConnectionInProgress: false,
      isConnectionEstablished: true,
      accounts: [],
      derivationPathPrefix: DEFAULT_DERIVATION_PATH_PREFIX,
      index: 0,
      isLoading: true,
      numberOfAccountsPerPage: DEFAULT_LEDGER_ACCOUNTS_PER_PAGE,
      advanced: false,
    });
  });

  describe("SET_LEDGER_WIZARD_ACCOUNTS", () => {
    it("should act on SET_LEDGER_WIZARD_ACCOUNTS action", () => {
      const newState = ledgerWizardReducer(
        ledgerWizardInitialState,
        actions.walletSelector.setLedgerAccounts(
          [{ address: "0x67", balanceETH: "123", balanceNEU: "0", derivationPath: "44/60" }],
          DEFAULT_DERIVATION_PATH_PREFIX,
        ),
      );

      expect(newState).to.be.deep.eq({
        isInitialConnectionInProgress: false,
        isConnectionEstablished: false,
        accounts: [
          { address: "0x67", balanceETH: "123", balanceNEU: "0", derivationPath: "44/60" },
        ],
        index: 0,
        isLoading: false,
        derivationPathPrefix: DEFAULT_DERIVATION_PATH_PREFIX,
        numberOfAccountsPerPage: DEFAULT_LEDGER_ACCOUNTS_PER_PAGE,
        advanced: false,
      });
    });

    it("should not act when derivation path prefix mismatch or advanced chooser", () => {
      const initialState = {
        ...ledgerWizardInitialState,
        advanced: true,
      };
      const newState = ledgerWizardReducer(
        initialState,
        actions.walletSelector.setLedgerAccounts(
          [{ address: "0x67", balanceETH: "123", balanceNEU: "0", derivationPath: "44/60" }],
          "",
        ),
      );

      expect(newState).to.be.deep.eq(initialState);
    });

    it("should act when derivation path prefix mismatch but advanced field is false", () => {
      const newAccounts = [
        { address: "0x67", balanceETH: "123", balanceNEU: "0", derivationPath: "44/60" },
      ];
      const initialState = ledgerWizardInitialState;
      const newState = ledgerWizardReducer(
        initialState,
        actions.walletSelector.setLedgerAccounts(newAccounts, ""),
      );

      expect(newState).to.be.deep.eq({
        ...initialState,
        isLoading: false,
        isInitialConnectionInProgress: false,
        accounts: newAccounts,
      });
    });
  });

  it("should act on LEDGER_CONNECTION_ESTABLISHED_ERROR action", () => {
    const expectedErrorMsg = createMessage(LedgerErrorMessage.GENERIC_ERROR);
    const action = actions.walletSelector.ledgerConnectionEstablishedError(expectedErrorMsg);

    const newState = ledgerWizardReducer(ledgerWizardInitialState, action);

    expect(newState).to.be.deep.eq({
      isInitialConnectionInProgress: false,
      isConnectionEstablished: false,
      errorMsg: expectedErrorMsg,
      accounts: [],
      index: 0,
      isLoading: false,
      derivationPathPrefix: DEFAULT_DERIVATION_PATH_PREFIX,
      numberOfAccountsPerPage: DEFAULT_LEDGER_ACCOUNTS_PER_PAGE,
      advanced: false,
    });
  });

  it("should act on SET_LEDGER_WIZARD_DERIVATION_PATH_PREFIX", () => {
    const newDerivationPath = "test";
    const newState = ledgerWizardReducer(
      ledgerWizardInitialState,
      actions.walletSelector.setLedgerWizardDerivationPathPrefix(newDerivationPath),
    );

    expect(newState).to.be.deep.eq({
      isInitialConnectionInProgress: false,
      isConnectionEstablished: false,
      isLoading: true,
      accounts: [],
      index: 0,
      derivationPathPrefix: newDerivationPath,
      numberOfAccountsPerPage: DEFAULT_LEDGER_ACCOUNTS_PER_PAGE,
      advanced: false,
      errorMsg: undefined,
    });
  });

  it("should act on TOGGLE_LEDGER_WIZARD_ADVANCED", () => {
    const state = ledgerWizardInitialState;
    const newState = ledgerWizardReducer(
      state,
      actions.walletSelector.toggleLedgerAccountsAdvanced(),
    );

    expect(newState).to.be.deep.eq({
      ...state,
      isLoading: true,
      advanced: true,
    });
  });
});
