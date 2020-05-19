import { DeepReadonly } from "@neufund/shared-utils";

import { TCompanyEtoData, TEtoSpecsData } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { AppReducer } from "../../store";
import { actions } from "../actions";
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

export const etoReducer: AppReducer<IEtoState> = (
  state = etoFlowInitialState,
  action,
): DeepReadonly<IEtoState> => {
  switch (action.type) {
    case actions.eto.setEtos.getType():
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
    case actions.eto.setEto.getType():
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
    case actions.eto.setEtosDisplayOrder.getType():
      return {
        ...state,
        displayOrder: action.payload.order,
      };
    case actions.eto.setEtoDataFromContract.getType():
      return {
        ...state,
        contracts: {
          ...state.contracts,
          [action.payload.previewCode]: action.payload.data,
        },
      };
    case actions.eto.setEtoWidgetError.getType():
      return {
        ...state,
        etoWidgetError: true,
      };
    case actions.eto.setTokenData.getType():
      return {
        ...state,
        tokenData: {
          ...state.tokenData,
          [action.payload.previewCode]: action.payload.tokenData,
        },
      };
    case actions.eto.setTokenGeneralDiscounts.getType():
      return {
        ...state,
        tokenGeneralDiscounts: {
          ...state.tokenGeneralDiscounts,
          [action.payload.etoId]: action.payload.tokenGeneralDiscounts,
        },
      };
    case actions.eto.setAgreementsStatus.getType():
      //todo actions.eto.setAgreementsStatus writes to both nominee-flow reducer and here.
      // This is for the backwards compat. until the issuer flow is refactored to use sagas
      // in the same way as nominee flow.
      return {
        ...state,
        offeringAgreementsStatus: {
          ...state.offeringAgreementsStatus,
          [action.payload.previewCode]: action.payload.statuses,
        },
      };
    //todo actions.eto.setInvestmentAgreementHash writes to both nominee-flow reducer and here.
    // This is for the backwards compat. until the issuer flow is refactored to use sagas
    // in the same way as nominee flow.
    case actions.eto.setInvestmentAgreementHash.getType():
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
    //todo actions.eto.loadInvestmentAgreementHash writes to both nominee-flow reducer and here.
    // This is for the backwards compat. until the issuer flow is refactored to use sagas
    // in the same way as nominee flow.
    case actions.eto.loadSignedInvestmentAgreement.getType():
      return {
        ...state,
        signedInvestmentAgreements: {
          ...state.signedInvestmentAgreements,
          [action.payload.previewCode]: { isLoading: true, url: undefined },
        },
      };

    case actions.eto.setEtosError.getType():
      return {
        ...state,
        etosError: true,
      };

    case actions.eto.loadEtos.getType():
      return {
        ...state,
        tokensLoading: true,
      };

    case actions.eto.setTokensLoadingDone.getType():
      return {
        ...state,
        tokensLoading: false,
      };
  }

  return state;
};
