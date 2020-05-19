import { ENomineeRequestComponentState } from "../../components/nominee-dashboard/linkToIssuer/types";
import { EProcessState } from "../../utils/enums/processStates";
import { TEtoWithCompanyAndContractReadonly, TOfferingAgreementsStatus } from "../eto/types";

export enum ENomineeRequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum ENomineeRequestError {
  NONE = "none",
  ISSUER_ID_ERROR = "issuer_id_error",
  REQUEST_EXISTS = "request_exists",
  GENERIC_ERROR = "nominee_request_generic_error",
}

export enum ENomineeFlowError {
  NONE = "none",
  FETCH_DATA_ERROR = "nomineeFetchDataError",
  ACTIVE_ETO_SET_ERROR = "activeEtoSetError",
  LOAD_ETOS_ERROR = "loadEtosError",
}

export enum ENomineeTaskStatus {
  NOT_DONE = "not_done",
  DONE = "done",
  ERROR = "error",
}

export enum ERedeemShareCapitalTaskSubstate {
  REDEEM_CAPITAL_INCREASE = "redeemCapitalIncrease",
  WAITING_FOR_ISSUER_TO_SIGN_ISHA = "waitingForIssuerToSignIsha",
}

export enum ENomineeLinkBankAccountStatus {
  NOT_DONE = "not_done",
  DONE = "done",
  ERROR = "error",
}

export enum ENomineeUploadIshaStatus {
  NOT_DONE = "not_done",
  DONE = "done",
  ERROR = "error",
}

export interface INomineeRequestMetadata {
  city: string;
  country: string;
  jurisdiction: string;
  legalForm: string;
  legalFormType: string;
  name: string;
  registrationNumber: string;
  street: string;
  zipCode: string;
}

export interface INomineeRequest {
  state: ENomineeRequestStatus;
  nomineeId: string;
  etoId: string;
  insertedAt: string;
  updatedAt: string;
  metadata: INomineeRequestMetadata;
}

// TODO: Refactor to store separately, nominee-flow module should not be used for issuer
export type TNomineeRequestStorage = { [id: string]: INomineeRequest }; //can be etoId or nomineeId

export enum ENomineeTask {
  NONE = "noTasks",
  ACCOUNT_SETUP = "accountSetup",
  LINK_TO_ISSUER = "linkToIssuer",
  LINK_BANK_ACCOUNT = "linkBankAccount",
}

export enum ENomineeEtoSpecificTask {
  ACCEPT_THA = "acceptTha",
  ACCEPT_RAAA = "acceptRaaa",
  REDEEM_SHARE_CAPITAL = "redeemShareCapital",
  ACCEPT_ISHA = "acceptIsha",
}

export type TNomineeEtoSpecificTasksStatus = {
  [key in ENomineeEtoSpecificTask]: ENomineeTaskStatus;
};
export type TNomineeTasksStatus = { [key in ENomineeTask]: ENomineeTaskStatus } & {
  byPreviewCode: {
    [previewCode: string]: TNomineeEtoSpecificTasksStatus;
  };
};
export type TNomineeEtosAdditionalData = {
  investmentAgreementUrl: string | undefined;
  offeringAgreementsStatus: TOfferingAgreementsStatus;
  capitalIncrease: string | undefined;
};
export type TNomineeTaskLinkToIssuerData = {
  nextState: ENomineeRequestComponentState;
  error: ENomineeRequestError;
};
export type TNoTasksData = {};
export type TLinkBankAccountData = {};
export type TAccountSetupData = {};
export type TNomineeTaskRedeemShareCapitalData = {
  capitalIncrease: string;
  walletBalance: string;
  taskSubstate: ERedeemShareCapitalTaskSubstate;
};
export type TNomineeTaskAcceptThaData = {};
export type TNomineeTaskAcceptRaaaData = {};
export type TNomineeTaskAcceptIshaData = {
  uploadState: EProcessState;
  uploadedFileName: string | undefined;
};
export type TNomineeEtoSpecificTaskData = {
  [ENomineeEtoSpecificTask.ACCEPT_THA]: TNomineeTaskAcceptThaData;
  [ENomineeEtoSpecificTask.ACCEPT_RAAA]: TNomineeTaskAcceptRaaaData;
  [ENomineeEtoSpecificTask.REDEEM_SHARE_CAPITAL]: TNomineeTaskRedeemShareCapitalData;
  [ENomineeEtoSpecificTask.ACCEPT_ISHA]: TNomineeTaskAcceptIshaData;
};
export type TTaskSpecificData = {
  byPreviewCode: {
    [previewCode: string]: TNomineeEtoSpecificTaskData;
  };
  [ENomineeTask.NONE]: TNoTasksData;
  [ENomineeTask.ACCOUNT_SETUP]: TAccountSetupData;
  [ENomineeTask.LINK_TO_ISSUER]: TNomineeTaskLinkToIssuerData;
};
export type TNomineeFlowState = {
  ready: boolean;
  loading: boolean;
  error: ENomineeFlowError;
  activeNomineeTask: ENomineeTask | ENomineeEtoSpecificTask;
  nomineeTasksData: TTaskSpecificData;
  activeNomineeEtoPreviewCode: string | undefined;
  nomineeRequests: TNomineeRequestStorage;
  nomineeEtos: { [previewCode: string]: TEtoWithCompanyAndContractReadonly };
  nomineeEtosAdditionalData: { [previewCode: string]: TNomineeEtosAdditionalData };
  nomineeTasksStatus: TNomineeTasksStatus;
};
