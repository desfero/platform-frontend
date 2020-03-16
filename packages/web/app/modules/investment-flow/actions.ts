import { createActionFactory, ECurrency } from "@neufund/shared";

import { EInvestmentErrorState, EInvestmentType } from "./reducer";

export const investmentFlowActions = {
  // public actions
  startInvestment: createActionFactory("INVESTMENT_FLOW_START", (etoId: string) => ({ etoId })),
  resetInvestment: createActionFactory("INVESTMENT_FLOW_RESET"),
  selectInvestmentType: createActionFactory(
    "INVESTMENT_FLOW_SELECT_INVESTMENT_TYPE",
    (type?: EInvestmentType) => ({ type }),
  ),
  submitCurrencyValue: createActionFactory(
    "INVESTMENT_FLOW_SUBMIT_INVESTMENT_VALUE",
    (value: string, currency: ECurrency) => ({ value, currency }),
  ),
  investEntireBalance: createActionFactory("INVESTMENT_FLOW_INVEST_ENTIRE_BALANCE"),
  validateInputs: createActionFactory("INVESTMENT_FLOW_VALIDATE_INPUTS"),

  // state mutations
  setEtoId: createActionFactory("INVESTMENT_FLOW_SET_ETO_ID", (etoId: string) => ({ etoId })),
  setEthValue: createActionFactory("INVESTMENT_FLOW_SET_INVESTMENT_ETH_VALUE", (value: string) => ({
    value,
  })),
  setEurValue: createActionFactory("INVESTMENT_FLOW_SET_INVESTMENT_EUR_VALUE", (value: string) => ({
    value,
  })),
  setErrorState: createActionFactory(
    "INVESTMENT_FLOW_SET_INVESTMENT_ERROR_STATE",
    (errorState?: EInvestmentErrorState) => ({ errorState }),
  ),
  setIsInputValidated: createActionFactory(
    "INVESTMENT_FLOW_SET_IS_INPUT_VALIDATED",
    (isValidated: boolean) => ({ isValidated }),
  ),
  setActiveInvestmentTypes: createActionFactory(
    "INVESTMENT_FLOW_SET_ACTIVE_INVESTMENT_TYPES",
    (activeInvestmentTypes: EInvestmentType[]) => ({ activeInvestmentTypes }),
  ),
};
