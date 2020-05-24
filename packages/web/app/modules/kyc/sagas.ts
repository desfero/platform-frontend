import { all, call, delay, fork, put, select } from "@neufund/sagas";
import { EJwtPermissions, IHttpResponse, IUser } from "@neufund/shared-modules";

import { KycFlowMessage } from "../../components/translatedMessages/messages";
import {
  createMessage,
  createNotificationMessage,
} from "../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../di/setupBindings";
import {
  EKycBusinessType,
  EKycRequestStatus,
  EKycRequestType,
  IKycBusinessData,
  IKycFileInfo,
  IKycIndividualData,
  IKycManagingDirector,
  TKycBankAccount,
  TKycStatus,
} from "../../lib/api/kyc/KycApi.interfaces";
import { IdentityRegistry } from "../../lib/contracts/IdentityRegistry";
import { TAppGlobalState } from "../../store";
import { actions, TActionFromCreator } from "../actions";
import { ensurePermissionsArePresentAndRunEffect } from "../auth/jwt/sagas";
import { selectIsUserVerified, selectUser } from "../auth/selectors";
import { displayErrorModalSaga } from "../generic-modal/sagas";
import { waitUntilSmartContractsAreInitialized } from "../init/sagas";
import { webNotificationUIModuleApi } from "../notification-ui/module";
import { neuCall, neuTakeEvery, neuTakeUntil } from "../sagasUtils";
import {
  deleteBeneficialOwner,
  loadBeneficialOwnerFiles,
  loadBeneficialOwners,
  throttledKycUploadBeneficialOwnerDocument,
  toggleBeneficialOwnerModal,
  updateBeneficialOwner,
} from "./beneficial-owner/sagas";
import { submitFinancialDisclosure } from "./financial-disclosure/sagas";
import { kycIdNowSagas } from "./instant-id/id-now/sagas";
import { kycOnfidoSagas } from "./instant-id/onfido/sagas";
import {
  loadLegalRepresentative,
  loadLegalRepresentativeFiles,
  submitLegalRepresentative,
  uploadLegalRepresentativeFile,
} from "./legal-representative/sagas";
import {
  selectCombinedBeneficialOwnerOwnership,
  selectKycRequestStatus,
  selectKycRequestType,
} from "./selectors";
import { deserializeClaims } from "./utils";

export function* loadKycStatus({
  apiKycService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.kyc.setStatusLoading());

    const kycStatus: TKycStatus = yield apiKycService.getKycStatus();

    yield put(actions.kyc.setStatus(kycStatus));
  } catch (e) {
    logger.error("Error while getting KYC status", e);

    yield put(actions.kyc.setStatusError(e.message));

    // let the caller know that status is unknown
    throw e;
  }
}

export function* loadClientData({ logger }: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield neuCall(loadKycStatus);

    const kycStatusType = yield* select(selectKycRequestType);

    switch (kycStatusType) {
      case EKycRequestType.BUSINESS:
        yield neuCall(loadBusinessData);

        break;
      case EKycRequestType.INDIVIDUAL:
        yield neuCall(loadIndividualData);

        break;
      default:
        logger.info(`Kyc type is ${kycStatusType} therefore omitting loading kyc data`);
    }
  } catch (e) {
    logger.error("Error while loading client kyc data", e);

    // we are not able to provide meaningful user experience in case of missing client data
    // rethrow the error to be catched by the root saga and show fallback UI
    throw e;
  }
}

/**
 * whole watcher feature is just a temporary workaround for a lack of real time communication with backend
 */
let kycWidgetWatchDelay: number = 1000;

function* kycStatusRefreshSaga({ logger }: TGlobalDependencies): Generator<any, any, any> {
  kycWidgetWatchDelay = 1000;
  while (true) {
    const requestType: EKycRequestType = yield select(selectKycRequestType);
    const status: EKycRequestStatus | undefined = yield select((s: TAppGlobalState) =>
      selectKycRequestStatus(s),
    );

    if (
      status === EKycRequestStatus.ACCEPTED ||
      status === EKycRequestStatus.REJECTED ||
      status === EKycRequestStatus.IGNORED
    ) {
      return;
    }

    if (status === EKycRequestStatus.PENDING || status === EKycRequestStatus.OUTSOURCED) {
      yield neuCall(loadClientData);
      yield neuCall(loadIdentityClaim);
      logger.info("KYC refreshed", status, requestType);
    }

    yield delay(kycWidgetWatchDelay);
    expandWatchTimeout();
  }
}

// it will sleep for 1000, 3000, and then always 10 000
function expandWatchTimeout(): void {
  // tslint:disable-next-line
  if (kycWidgetWatchDelay === 1000) {
    kycWidgetWatchDelay = 3000;
  } else {
    kycWidgetWatchDelay = 10000;
  }
}

/**
 * Individual Request
 */
function* loadIdentityClaim({
  contractsService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    const identityRegistry: IdentityRegistry = contractsService.identityRegistry;

    const loggedInUser: IUser = yield select((state: TAppGlobalState) => selectUser(state));

    const claims: string = yield identityRegistry.getClaims(loggedInUser.userId);

    yield put(actions.kyc.kycSetClaims(deserializeClaims(claims)));
  } catch (e) {
    logger.error("Error while loading kyc identity claims", e);

    // we are not able to provide meaningful user experience in case of missing identity data
    // rethrow the error to be catched by the root saga and show fallback UI
    throw e;
  }
}

/**
 * Individual Request
 */
function* loadIndividualData({
  apiKycService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateIndividualData(true));
    const result: IHttpResponse<IKycIndividualData> = yield apiKycService.getIndividualData();
    yield put(actions.kyc.kycUpdateIndividualData(false, result.body));
  } catch (e) {
    if (e.status !== 404) {
      logger.error("Failed to load KYC individual data", e);
    }

    yield put(actions.kyc.kycUpdateIndividualData(false));
  }
}

export function* submitPersonalDataSaga(
  { apiKycService }: TGlobalDependencies,
  data: IKycIndividualData,
): Generator<any, any, any> {
  const result: IHttpResponse<IKycIndividualData> = yield apiKycService.putPersonalData(data);

  // update kyc status after submitting personal data as it may affect supported instant id providers
  yield neuCall(loadKycStatus);

  yield put(
    actions.kyc.kycUpdateIndividualData(false, {
      ...result.body,
      isAccreditedUsCitizen: data.isAccreditedUsCitizen,
    }),
  );
}

function* submitPersonalDataNoRedirect(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitPersonalData>,
): Generator<any, any, any> {
  try {
    const { data } = action.payload;
    yield neuCall(submitPersonalDataSaga, data);
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA),
      ),
    );

    logger.error("Failed to submit KYC individual data", e);
  }
}

function* submitPersonalData(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitPersonalData>,
): Generator<any, any, any> {
  try {
    const { data } = action.payload;
    yield neuCall(submitPersonalDataSaga, data);

    yield put(actions.routing.goToKYCIndividualAddress());
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA),
      ),
    );

    logger.error("Failed to submit KYC individual data", e);
  }
}

function* submitPersonalDataAndClose(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitPersonalDataAndClose>,
): Generator<any, any, any> {
  try {
    const { data } = action.payload;
    yield neuCall(submitPersonalDataSaga, data);

    yield put(actions.routing.goToDashboard());
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA),
      ),
    );

    logger.error("Failed to submit KYC individual data", e);
  }
}

function* submitPersonalAddressSaga(
  { apiKycService, logger }: TGlobalDependencies,
  data: IKycIndividualData,
): Generator<any, any, any> {
  try {
    const result: IHttpResponse<IKycIndividualData> = yield apiKycService.putPersonalData(data);

    yield put(actions.kyc.kycUpdateIndividualData(false, result.body));

    return true;
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA),
      ),
    );

    logger.error("Failed to submit KYC individual data", e);
  }
}

function* submitPersonalAddress(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitPersonalAddress>,
): Generator<any, any, any> {
  const { data } = action.payload;
  const success = yield neuCall(submitPersonalAddressSaga, data);

  if (success) {
    yield put(actions.routing.goToKYCIndividualFinancialDisclosure());
  }
}

function* submitPersonalAddressAndClose(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitPersonalAddress>,
): Generator<any, any, any> {
  const { data } = action.payload;
  const success = yield neuCall(submitPersonalAddressSaga, data);

  if (success) {
    yield put(actions.routing.goToDashboard());
  }
}

function* uploadIndividualFile(
  { apiKycService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycUploadIndividualDocument>,
): Generator<any, any, any> {
  const { file } = action.payload;
  try {
    yield put(actions.kyc.kycUpdateIndividualDocument(true));
    const result: IHttpResponse<IKycFileInfo> = yield apiKycService.uploadIndividualDocument(file);
    yield put(actions.kyc.kycUpdateIndividualDocument(false, result.body));
    yield put(
      webNotificationUIModuleApi.actions.showInfo(
        createNotificationMessage(KycFlowMessage.KYC_UPLOAD_SUCCESSFUL),
      ),
    );
  } catch (e) {
    yield put(actions.kyc.kycUpdateIndividualDocument(false));

    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_UPLOAD_FAILED),
      ),
    );

    logger.error("Failed to upload KYC individual file", e);
  }
}

function* loadIndividualFiles({
  apiKycService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateIndividualDocuments(true));
    const result: IHttpResponse<IKycFileInfo[]> = yield apiKycService.getIndividualDocuments();
    yield put(actions.kyc.kycUpdateIndividualDocuments(false, result.body));
  } catch (e) {
    yield put(actions.kyc.kycUpdateIndividualDocuments(false));

    if (e.status !== 404) {
      logger.error("Failed to load KYC individual files", e);
    }
  }
}

function* submitIndividualRequestEffect({
  apiKycService,
}: TGlobalDependencies): Generator<any, any, any> {
  const kycStatus: TKycStatus = yield apiKycService.submitIndividualRequest();

  yield put(actions.kyc.setStatus(kycStatus));
  yield put(actions.routing.goToKYCSuccess());
}

function* submitIndividualRequest({ logger }: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(submitIndividualRequestEffect),
      [EJwtPermissions.SUBMIT_KYC_PERMISSION],
      createMessage(KycFlowMessage.KYC_SUBMIT_TITLE),
      createMessage(KycFlowMessage.KYC_SUBMIT_DESCRIPTION),
    );
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_SUBMIT_FAILED),
      ),
    );

    logger.error("Failed to submit KYC individual request", e);
  }
}

/**
 * Company Request
 */

// legal representative

// business data
function* setBusinessType(
  { apiKycService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSetBusinessType>,
): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateBusinessData(true));
    let institutionData: IKycBusinessData = {};
    // TODO: Pretty bad use of `catch` we need to log an error if it's not 404
    try {
      const result: IHttpResponse<IKycBusinessData> = yield apiKycService.getBusinessData();
      institutionData = result.body;
    } catch (_e) {}
    institutionData = { ...institutionData, legalFormType: action.payload.type };
    yield apiKycService.putBusinessData(institutionData);
    yield put(actions.kyc.kycUpdateBusinessData(false, institutionData));
    yield put(actions.routing.goToKYCBusinessData());
  } catch (e) {
    yield put(actions.kyc.kycUpdateBusinessData(false));

    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA),
      ),
    );

    logger.error("Failed to set KYC business", e);
  }
}

// legal representative
function* loadBusinessData({
  apiKycService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateBusinessData(true));
    const result: IHttpResponse<IKycBusinessData> = yield apiKycService.getBusinessData();

    yield put(actions.kyc.kycUpdateBusinessData(false, result.body));
  } catch (e) {
    if (e.status !== 404) {
      logger.error("Failed to load KYC business data", e);
    }

    yield put(actions.kyc.kycUpdateBusinessData(false));
  }
}

function* submitBusinessData(
  { apiKycService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitBusinessData>,
): Generator<any, any, any> {
  try {
    const { data, file, close } = action.payload;

    yield put(actions.kyc.kycUpdateBusinessData(true));
    // TODO legalFormType is hardocded for now
    const result: IHttpResponse<IKycBusinessData> = yield apiKycService.putBusinessData({
      ...data,
      legalFormType: EKycBusinessType.SMALL,
    });
    yield put(actions.kyc.kycUpdateBusinessData(false, result.body));

    if (file) {
      yield neuCall(uploadBusinessFile, {
        type: actions.kyc.kycUploadBusinessDocument.getType(),
        payload: { file },
      });
    } else {
      if (close) {
        yield put(actions.routing.goToDashboard());
      } else {
        yield put(actions.routing.goToKYCManagingDirectors());
      }
    }
  } catch (e) {
    yield put(actions.kyc.kycUpdateBusinessData(false));

    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA),
      ),
    );

    logger.error("Failed to submit KYC business data", e);
  }
}

function* uploadBusinessFile(
  { apiKycService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycUploadBusinessDocument>,
): Generator<any, any, any> {
  const { file } = action.payload;
  try {
    yield put(actions.kyc.kycUpdateBusinessDocument(true));
    const result: IHttpResponse<IKycFileInfo> = yield apiKycService.uploadBusinessDocument(file);
    yield put(actions.kyc.kycUpdateBusinessDocument(false, result.body));
    yield put(
      webNotificationUIModuleApi.actions.showInfo(
        createNotificationMessage(KycFlowMessage.KYC_UPLOAD_SUCCESSFUL),
      ),
    );
  } catch (e) {
    yield put(actions.kyc.kycUpdateBusinessDocument(false));

    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_UPLOAD_FAILED),
      ),
    );

    logger.error("Failed to upload KYC business file", e);
  }
}

function* loadBusinessFiles({
  apiKycService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateBusinessDocuments(true));
    const result: IHttpResponse<IKycFileInfo[]> = yield apiKycService.getBusinessDocuments();
    yield put(actions.kyc.kycUpdateBusinessDocuments(false, result.body));
  } catch (e) {
    yield put(actions.kyc.kycUpdateBusinessDocuments(false));

    if (e.status !== 404) {
      logger.error("Failed to load KYC business files", e);
    }
  }
}

// managing director
function* loadManagingDirectorsData({
  apiKycService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateManagingDirector(true));
    const result: IHttpResponse<IKycManagingDirector> = yield apiKycService.getManagingDirectors();
    yield put(actions.kyc.kycUpdateManagingDirector(false, result.body));
  } catch (e) {
    yield put(actions.kyc.kycUpdateManagingDirector(false));
    logger.error("Failed to load KYC managing director", e);
  }
}

function* loadManagingDirectorFiles({
  apiKycService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateManagingDirectorDocuments(true));
    const result: IHttpResponse<IKycFileInfo[]> = yield apiKycService.getManagingDirectorDocuments();
    yield put(actions.kyc.kycUpdateManagingDirectorDocuments(false, result.body));
  } catch (e) {
    yield put(actions.kyc.kycUpdateManagingDirectorDocuments(false));

    if (e.status !== 404) {
      logger.error("Failed to load KYC managing director files", e);
    }
  }
}

function* submitAndUploadManagingDirector(
  { apiKycService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitAndUploadManagingDirector>,
): Generator<any, any, any> {
  const { data, file } = action.payload;

  yield put(actions.kyc.kycUpdateManagingDirector(true));
  yield put(actions.kyc.kycUpdateManagingDirectorDocument(true));

  try {
    const putResult: IHttpResponse<IKycBusinessData> = yield apiKycService.putManagingDirector(
      data,
    );
    yield put(actions.kyc.kycUpdateManagingDirector(false, putResult.body));
  } catch (e) {
    yield put(actions.kyc.kycUpdateManagingDirector(false));
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA),
      ),
    );
  }

  try {
    const uploadResult: IHttpResponse<IKycFileInfo> = yield apiKycService.uploadManagingDirectorDocument(
      file,
    );
    yield put(actions.kyc.kycUpdateManagingDirectorDocument(false, uploadResult.body));
  } catch (e) {
    yield put(actions.kyc.kycUpdateManagingDirectorDocument(false));
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_UPLOAD_FAILED),
      ),
    );
    logger.error("Failed to upload KYC managing director file", e);
  }
}

// request
function* submitBusinessRequestEffect({
  apiKycService,
}: TGlobalDependencies): Generator<any, any, any> {
  const kycStatus: TKycStatus = yield apiKycService.submitBusinessRequest();

  yield put(actions.kyc.setStatus(kycStatus));
}

function* kycSubmitManagingDirector(
  { apiKycService }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitManagingDirector>,
): Generator<any, any, any> {
  const { data } = action.payload;
  yield put(actions.kyc.kycUpdateManagingDirector(true));

  try {
    const putResult: IHttpResponse<IKycBusinessData> = yield apiKycService.putManagingDirector(
      data,
    );
    yield put(actions.kyc.kycUpdateManagingDirector(false, putResult.body));
    yield put(actions.kyc.kycToggleManagingDirectorModal(false));
  } catch (e) {
    yield put(actions.kyc.kycUpdateManagingDirector(false));
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA),
      ),
    );
  }
}

function* submitBusinessRequest({ logger }: TGlobalDependencies): Generator<any, any, any> {
  try {
    // check whether combined value of beneficial owners percentages is less or equal 100%
    const ownerShip = yield select((s: TAppGlobalState) =>
      selectCombinedBeneficialOwnerOwnership(s.kyc),
    );
    if (ownerShip > 100) {
      yield call(
        displayErrorModalSaga,
        createMessage(KycFlowMessage.KYC_ERROR),
        createMessage(KycFlowMessage.KYC_BENEFICIAL_OWNERS),
      );
      return;
    }

    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(submitBusinessRequestEffect),
      [EJwtPermissions.SUBMIT_KYC_PERMISSION],
      createMessage(KycFlowMessage.KYC_SUBMIT_TITLE),
      createMessage(KycFlowMessage.KYC_SUBMIT_DESCRIPTION),
    );
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_SUBMIT_FAILED),
      ),
    );

    logger.error("Failed to submit KYC business request", e);
  }
}

export function* loadBankAccountDetails({
  apiKycService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    // bank details depend on claims `hasBankAccount` flag
    // so to have consistent ui we need to reload claims
    yield put(actions.kyc.kycLoadClaims());

    const isVerified: boolean = yield select(selectIsUserVerified);

    // bank account api can only be called when account is verified
    if (isVerified) {
      const result: TKycBankAccount = yield apiKycService.getBankAccount();

      yield put(actions.kyc.setQuintessenceBankAccountDetails(result.ourAccount));

      if (result.verifiedUserAccount !== undefined) {
        yield put(
          actions.kyc.setBankAccountDetails({
            hasBankAccount: true,
            details: result.verifiedUserAccount,
          }),
        );
      } else {
        yield put(
          actions.kyc.setBankAccountDetails({
            hasBankAccount: false,
          }),
        );
      }
    } else {
      yield put(
        actions.kyc.setBankAccountDetails({
          hasBankAccount: false,
        }),
      );
    }
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_PROBLEM_LOADING_BANK_DETAILS),
      ),
    );

    logger.error("Error while loading kyc bank details", e);

    yield put(
      actions.kyc.setBankAccountDetails({
        hasBankAccount: false,
      }),
    );
  }
}

export function* loadKycRequestData(): Generator<any, any, any> {
  // Wait for contracts to init
  yield waitUntilSmartContractsAreInitialized();

  yield all([neuCall(loadClientData), neuCall(loadIdentityClaim)]);
}

export function* kycSagas(): Generator<any, any, any> {
  yield fork(neuTakeEvery, actions.kyc.kycLoadStatusAndData, loadClientData);

  yield fork(neuTakeEvery, actions.kyc.kycLoadIndividualData, loadIndividualData);
  yield fork(neuTakeEvery, actions.kyc.kycSubmitPersonalData, submitPersonalData);
  yield fork(neuTakeEvery, actions.kyc.kycSubmitPersonalDataAndClose, submitPersonalDataAndClose);
  yield fork(
    neuTakeEvery,
    actions.kyc.kycSubmitPersonalDataNoRedirect,
    submitPersonalDataNoRedirect,
  );
  yield fork(neuTakeEvery, actions.kyc.kycSubmitPersonalAddress, submitPersonalAddress);
  yield fork(
    neuTakeEvery,
    actions.kyc.kycSubmitPersonalAddressAndClose,
    submitPersonalAddressAndClose,
  );
  yield fork(neuTakeEvery, actions.kyc.kycUploadIndividualDocument, uploadIndividualFile);
  yield fork(neuTakeEvery, actions.kyc.kycLoadIndividualDocumentList, loadIndividualFiles);
  yield fork(neuTakeEvery, actions.kyc.kycSubmitFinancialDisclosure, submitFinancialDisclosure);

  // Outsourced
  yield fork(neuTakeEvery, actions.kyc.kycSubmitIndividualRequest, submitIndividualRequest);

  yield fork(neuTakeEvery, actions.kyc.kycLoadLegalRepresentative, loadLegalRepresentative);
  yield fork(neuTakeEvery, actions.kyc.kycSubmitLegalRepresentative, submitLegalRepresentative);
  yield fork(
    neuTakeEvery,
    actions.kyc.kycUploadLegalRepresentativeDocument,
    uploadLegalRepresentativeFile,
  );
  yield fork(
    neuTakeEvery,
    actions.kyc.kycLoadLegalRepresentativeDocumentList,
    loadLegalRepresentativeFiles,
  );

  yield fork(neuTakeEvery, actions.kyc.kycSetBusinessType, setBusinessType);
  yield fork(neuTakeEvery, actions.kyc.kycLoadBusinessData, loadBusinessData);
  yield fork(neuTakeEvery, actions.kyc.kycSubmitBusinessData, submitBusinessData);
  yield fork(neuTakeEvery, actions.kyc.kycUploadBusinessDocument, uploadBusinessFile);
  yield fork(neuTakeEvery, actions.kyc.kycLoadBusinessDocumentList, loadBusinessFiles);

  yield fork(neuTakeEvery, actions.kyc.kycLoadManagingDirector, loadManagingDirectorsData);
  yield fork(neuTakeEvery, actions.kyc.kycSubmitManagingDirector, kycSubmitManagingDirector);
  yield fork(
    neuTakeEvery,
    actions.kyc.kycLoadManagingDirectorDocumentList,
    loadManagingDirectorFiles,
  );
  yield fork(
    neuTakeEvery,
    actions.kyc.kycSubmitAndUploadManagingDirector,
    submitAndUploadManagingDirector,
  );

  yield fork(neuTakeEvery, actions.kyc.kycLoadBeneficialOwners, loadBeneficialOwners);
  yield fork(neuTakeEvery, actions.kyc.kycSubmitBeneficialOwner, updateBeneficialOwner);
  yield fork(neuTakeEvery, actions.kyc.kycDeleteBeneficialOwner, deleteBeneficialOwner);
  yield fork(throttledKycUploadBeneficialOwnerDocument);
  yield fork(neuTakeEvery, actions.kyc.kycToggleBeneficialOwnerModal, toggleBeneficialOwnerModal);
  yield fork(
    neuTakeEvery,
    actions.kyc.kycLoadBeneficialOwnerDocumentList,
    loadBeneficialOwnerFiles,
  );

  yield fork(neuTakeEvery, actions.kyc.kycSubmitBusinessRequest, submitBusinessRequest);

  yield fork(neuTakeEvery, actions.kyc.loadBankAccountDetails, loadBankAccountDetails);

  yield fork(neuTakeEvery, actions.kyc.kycLoadClaims, loadIdentityClaim);

  yield fork(
    neuTakeUntil,
    actions.kyc.kycStartWatching,
    actions.kyc.kycStopWatching,
    kycStatusRefreshSaga,
  );

  // sub-sagas
  yield fork(kycOnfidoSagas);
  yield fork(kycIdNowSagas);
}
