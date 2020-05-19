import { AppReducer } from "@neufund/sagas";
import { DeepReadonly } from "@neufund/shared-utils";

import { etoActions } from "./actions";
import { TCompanyEtoData, TEtoSpecsData } from "./lib/http/eto-api/EtoApi.interfaces.unsafe";
import {
  IEtoTokenData,
  IEtoTokenGeneralDiscounts,
  SignedISHAStatus,
  TEtoContractData,
  TOfferingAgreementsStatus,
} from "./types";

export interface IEtoState {
  etos: { [previewCode: string]: TEtoSpecsData | undefined };
  etosError: boolean;
  companies: { [companyId: string]: TCompanyEtoData | undefined };
  contracts: { [previewCode: string]: TEtoContractData | undefined };
  displayOrder: string[] | undefined;
  maxCapExceeded: { [previewCode: string]: boolean | undefined };
  etoWidgetError: boolean | undefined;
  tokenData: { [previewCode: string]: IEtoTokenData | undefined };
  tokenGeneralDiscounts: { [etoId: string]: IEtoTokenGeneralDiscounts | undefined };
  offeringAgreementsStatus: { [previewCode: string]: TOfferingAgreementsStatus | undefined };
  signedInvestmentAgreements: { [previewCode: string]: SignedISHAStatus | undefined };
  tokensLoading: boolean;
}

export const etoFlowInitialState: IEtoState = {
  etos: {},
  etosError: false,
  companies: {},
  contracts: {},
  displayOrder: undefined,
  maxCapExceeded: {},
  etoWidgetError: undefined,
  tokenData: {},
  tokenGeneralDiscounts: {},
  offeringAgreementsStatus: {},
  signedInvestmentAgreements: {},
  tokensLoading: false,
};

export const etoReducer: AppReducer<IEtoState, typeof etoActions> = (
  state = etoFlowInitialState,
  action,
): DeepReadonly<IEtoState> => {
  switch (action.type) {
    case etoActions.setEtos.getType():
      return {
        ...state,
        etos: {
          ...state.etos,
          ...action.payload.etos,
        },
        companies: {
          ...state.companies,
          ...action.payload.companies,
        },
        etosError: false,
      };
    case etoActions.setEto.getType():
      return {
        ...state,
        etos: {
          ...state.etos,
          [action.payload.eto.previewCode]: action.payload.eto,
        },
        companies: {
          ...state.companies,
          ...(action.payload.company
            ? { [action.payload.company.companyId]: action.payload.company }
            : {}),
        },
      };
    case etoActions.setEtosDisplayOrder.getType():
      return {
        ...state,
        displayOrder: action.payload.order,
      };
    case etoActions.setEtoDataFromContract.getType():
      return {
        ...state,
        contracts: {
          ...state.contracts,
          [action.payload.previewCode]: action.payload.data,
        },
      };
    case etoActions.setEtoWidgetError.getType():
      return {
        ...state,
        etoWidgetError: true,
      };
    case etoActions.setTokenData.getType():
      return {
        ...state,
        tokenData: {
          ...state.tokenData,
          [action.payload.previewCode]: action.payload.tokenData,
        },
      };
    case etoActions.setTokenGeneralDiscounts.getType():
      return {
        ...state,
        tokenGeneralDiscounts: {
          ...state.tokenGeneralDiscounts,
          [action.payload.etoId]: action.payload.tokenGeneralDiscounts,
        },
      };
    case etoActions.setAgreementsStatus.getType():
      //todo etoActions.setAgreementsStatus writes to both nominee-flow reducer and here.
      // This is for the backwards compat. until the issuer flow is refactored to use sagas
      // in the same way as nominee flow.
      return {
        ...state,
        offeringAgreementsStatus: {
          ...state.offeringAgreementsStatus,
          [action.payload.previewCode]: action.payload.statuses,
        },
      };
    //todo etoActions.setInvestmentAgreementHash writes to both nominee-flow reducer and here.
    // This is for the backwards compat. until the issuer flow is refactored to use sagas
    // in the same way as nominee flow.
    case etoActions.setInvestmentAgreementHash.getType():
      return {
        ...state,
        signedInvestmentAgreements: {
          ...state.signedInvestmentAgreements,
          [action.payload.previewCode]: {
            isLoading: false,
            url: action.payload.url,
          },
        },
      };
    //todo etoActions.loadInvestmentAgreementHash writes to both nominee-flow reducer and here.
    // This is for the backwards compat. until the issuer flow is refactored to use sagas
    // in the same way as nominee flow.
    case etoActions.loadSignedInvestmentAgreement.getType():
      return {
        ...state,
        signedInvestmentAgreements: {
          ...state.signedInvestmentAgreements,
          [action.payload.previewCode]: { isLoading: true, url: undefined },
        },
      };

    case etoActions.setEtosError.getType():
      return {
        ...state,
        etosError: true,
      };

    case etoActions.loadEtos.getType():
      return {
        ...state,
        tokensLoading: true,
      };

    case etoActions.setTokensLoadingDone.getType():
      return {
        ...state,
        tokensLoading: false,
      };
  }

  return state;
};

const etoReducerMap = {
  eto: etoReducer,
};

export { etoReducerMap };
