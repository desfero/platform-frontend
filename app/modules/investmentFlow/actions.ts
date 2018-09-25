import { createAction, createSimpleAction } from "../actionsUtils";
import { EBankTransferFlowState, EInvestmentCurrency, EInvestmentErrorState, EInvestmentType } from "./reducer";

export const investmentFlowActions = {
  // public actions
  startInvestment: (etoId: string) => createAction("INVESTMENT_FLOW_START", { etoId }),
  resetInvestment: () => createSimpleAction("INVESTMENT_FLOW_RESET"),
  selectInvestmentType: (type: EInvestmentType) =>
    createAction("INVESTMENT_FLOW_SELECT_INVESTMENT_TYPE", { type }),
  submitCurrencyValue: (value: string, currency: EInvestmentCurrency) =>
    createAction("INVESTMENT_FLOW_SUBMIT_INVESTMENT_VALUE", { value, currency }),
  validateInputs: () => createSimpleAction("INVESTMENT_FLOW_VALIDATE_INPUTS"),
  generateInvestmentTx: () => createSimpleAction("INVESTMENT_FLOW_GENERATE_TX"),
  showBankTransferDetails: () => createSimpleAction("INVESTMENT_FLOW_SHOW_BANK_TRANSFER_DETAILS"),
  showBankTransferSummary: () => createSimpleAction("INVESTMENT_FLOW_SHOW_BANK_TRANSFER_SUMMARY"),
  // state mutations
  setEtoId: (etoId: string) => createAction("INVESTMENT_FLOW_SET_ETO_ID", { etoId }),
  setEthValue: (value: string) =>
    createAction("INVESTMENT_FLOW_SET_INVESTMENT_ETH_VALUE", { value }),
  setEurValue: (value: string) =>
    createAction("INVESTMENT_FLOW_SET_INVESTMENT_EUR_VALUE", { value }),
  setGasPrice: (gasPrice?: string) => createAction("INVESTMENT_FLOW_SET_GAS_PRICE", { gasPrice }),
  setErrorState: (errorState?: EInvestmentErrorState) =>
    createAction("INVESTMENT_FLOW_SET_INVESTMENT_ERROR_STATE", { errorState }),
  setIsInputValidated: (isValidated: boolean) =>
    createAction("INVESTMENT_FLOW_SET_IS_INPUT_VALIDATED", { isValidated }),
  setBankTransferFlowState: (state: EBankTransferFlowState) =>
    createAction("INVESTMENT_FLOW_SET_BANK_TRANSFER_FLOW_STATE", { state }),
};
