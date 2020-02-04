import { DeepReadonly, Dictionary } from "@neufund/shared";

import {
  IKycBeneficialOwner,
  IKycBusinessData,
  IKycFileInfo,
  IKycIndividualData,
  IKycLegalRepresentative,
  KycBankQuintessenceBankAccount,
  TKycStatus,
} from "../../lib/api/kyc/KycApi.interfaces";
import { AppReducer } from "../../store";
import { actions } from "../actions";
import { idNowInitialState, idNowReducer, IKycIdNowState } from "./instant-id/id-now/reducer";
import { IKycOnfidoState, onfidoInitialState, onfidoReducer } from "./instant-id/onfido/reducer";
import { TBankAccount, TClaims } from "./types";
import { appendIfExists, conditionalCounter, omitUndefined, updateArrayItem } from "./utils";

export interface IKycState {
  onfido: DeepReadonly<IKycOnfidoState>;
  idNow: DeepReadonly<IKycIdNowState>;

  status: TKycStatus | undefined;
  statusLoading: boolean;
  statusError: string | undefined;

  // individual
  individualData: IKycIndividualData | undefined;
  individualDataLoading: boolean;

  individualFilesLoading: boolean;
  individualFilesUploadingCount: number;
  individualFiles: IKycFileInfo[];

  // business
  businessData: IKycBusinessData | undefined;
  businessDataLoading: boolean;

  businessFilesLoading: boolean;
  businessFilesUploadingCount: number;
  businessFiles: IKycFileInfo[];

  // legal representatives
  legalRepresentative: IKycLegalRepresentative | undefined;
  legalRepresentativeLoading: boolean;
  legalRepresentativeFilesLoading: boolean;
  legalRepresentativeFilesUploadingCount: number;
  legalRepresentativeFiles: IKycFileInfo[];

  // beneficial owners
  loadingBeneficialOwners: boolean;
  loadingBeneficialOwner: boolean;
  beneficialOwners: IKycBeneficialOwner[];
  beneficialOwnerFilesLoading: Dictionary<boolean>;
  beneficialOwnerFilesUploadingCount: Dictionary<number>;
  beneficialOwnerFiles: Dictionary<IKycFileInfo[]>;

  // contract claims
  claims: TClaims | undefined;

  // api bank details
  bankAccount: TBankAccount | undefined;
  quintessenceBankAccount: KycBankQuintessenceBankAccount | undefined;

  kycSaving: boolean | undefined;
}

const kycInitialState: IKycState = {
  onfido: onfidoInitialState,
  idNow: idNowInitialState,

  status: undefined,
  statusLoading: false,
  statusError: undefined,

  individualData: undefined,
  individualDataLoading: false,

  individualFilesLoading: false,
  individualFilesUploadingCount: 0,
  individualFiles: [],

  businessData: undefined,
  businessDataLoading: false,

  businessFilesLoading: false,
  businessFilesUploadingCount: 0,
  businessFiles: [],

  legalRepresentative: undefined,
  legalRepresentativeLoading: false,
  legalRepresentativeFilesLoading: false,
  legalRepresentativeFilesUploadingCount: 0,
  legalRepresentativeFiles: [],

  loadingBeneficialOwners: false,
  loadingBeneficialOwner: false,
  beneficialOwners: [],
  beneficialOwnerFiles: {},
  beneficialOwnerFilesLoading: {},
  beneficialOwnerFilesUploadingCount: {},

  claims: undefined,

  bankAccount: undefined,
  quintessenceBankAccount: undefined,
  kycSaving: undefined,
};

export const kycReducer: AppReducer<IKycState> = (
  reduxState = kycInitialState,
  action,
): DeepReadonly<IKycState> => {
  const state = {
    ...reduxState,
    onfido: onfidoReducer(reduxState.onfido, action),
    idNow: idNowReducer(reduxState.idNow, action),
  };

  switch (action.type) {
    // general
    case actions.kyc.setStatusLoading.getType():
      return {
        ...state,
        statusLoading: true,
      };
    case actions.kyc.setStatus.getType():
      return {
        ...state,
        status: action.payload.status,
        statusLoading: false,
        statusError: undefined,
      };
    case actions.kyc.setStatusError.getType():
      return {
        ...state,
        status: undefined,
        statusLoading: false,
        statusError: action.payload.error,
      };

    // individual
    case actions.kyc.kycSubmitPersonalData.getType():
    case actions.kyc.kycSubmitPersonalDataAndClose.getType():
    case actions.kyc.kycSubmitPersonalDataNoRedirect.getType():
      return { ...state, ...omitUndefined(action.payload), kycSaving: true };
    case actions.kyc.kycUpdateIndividualData.getType():
      return { ...state, kycSaving: false, ...omitUndefined(action.payload) };
    case actions.kyc.kycUpdateIndividualDocuments.getType():
      return { ...state, ...omitUndefined(action.payload) };
    case actions.kyc.kycUpdateIndividualDocument.getType():
      return {
        ...state,
        individualFilesUploadingCount: conditionalCounter(
          action.payload.individualFileUploading,
          state.individualFilesUploadingCount,
        ),
        individualFiles: appendIfExists(state.individualFiles, action.payload.file),
      };
    case actions.kyc.kycUpdateBusinessData.getType():
    case actions.kyc.kycUpdateBusinessDocuments.getType():
    case actions.kyc.kycUpdateLegalRepresentative.getType():
    case actions.kyc.kycUpdateLegalRepresentativeDocuments.getType():
    case actions.kyc.kycUpdateBeneficialOwners.getType():
      return { ...state, ...omitUndefined(action.payload) };
    case actions.kyc.kycUpdateLegalRepresentativeDocument.getType():
      return {
        ...state,
        legalRepresentativeFilesUploadingCount: conditionalCounter(
          action.payload.legalRepresentativeUploading,
          state.legalRepresentativeFilesUploadingCount,
        ),
        legalRepresentativeFiles: appendIfExists(
          state.legalRepresentativeFiles,
          action.payload.file,
        ),
      };
    case actions.kyc.kycUpdateBusinessDocument.getType():
      return {
        ...state,
        businessFilesUploadingCount: conditionalCounter(
          action.payload.businessFileUploading,
          state.businessFilesUploadingCount,
        ),
        businessFiles: appendIfExists(state.businessFiles, action.payload.file),
      };
    case actions.kyc.kycUpdateBeneficialOwner.getType():
      return {
        ...state,
        loadingBeneficialOwner: action.payload.loadingBeneficialOwner,
        beneficialOwners: updateArrayItem(
          state.beneficialOwners,
          action.payload.id,
          action.payload.beneficialOwner,
        ),
      };
    case actions.kyc.kycUpdateBeneficialOwnerDocuments.getType():
      return {
        ...state,
        beneficialOwnerFilesLoading: {
          ...state.beneficialOwnerFilesLoading,
          [action.payload.boid]: action.payload.beneficialOwnerFilesLoading,
        },
        beneficialOwnerFiles: {
          ...state.beneficialOwnerFiles,
          [action.payload.boid]: action.payload.beneficialOwnerFiles,
        },
      };
    case actions.kyc.kycUpdateBeneficialOwnerDocument.getType():
      const { boid } = action.payload;
      return {
        ...state,
        beneficialOwnerFilesUploadingCount: {
          ...state.beneficialOwnerFilesUploadingCount,
          [boid]: conditionalCounter(
            action.payload.beneficialOwnerFileUploading,
            state.beneficialOwnerFilesUploadingCount[boid],
          ),
        },
        beneficialOwnerFiles: {
          ...state.beneficialOwnerFiles,
          [boid]: appendIfExists(state.beneficialOwnerFiles[boid], action.payload.file),
        },
      };
    // contract claims
    case actions.kyc.kycSetClaims.getType():
      return { ...state, claims: action.payload.claims };

    // api bank account
    case actions.kyc.setBankAccountDetails.getType(): {
      return { ...state, bankAccount: action.payload.bankAccount };
    }

    case actions.kyc.setQuintessenceBankAccountDetails.getType(): {
      return { ...state, quintessenceBankAccount: action.payload.quintessenceBankAccount };
    }

    default:
      return state;
  }
};
