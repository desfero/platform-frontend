import { all, call, delay, fork, put, select } from "@neufund/sagas";
import { EJwtPermissions } from "@neufund/shared";

import { KycFlowMessage } from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../di/setupBindings";
import { IHttpResponse } from "../../lib/api/client/IHttpClient";
import {
  EKycRequestStatus,
  EKycRequestType,
  IKycBeneficialOwner,
  IKycBusinessData,
  IKycFileInfo,
  IKycIndividualData,
  IKycLegalRepresentative,
  TKycBankAccount,
  TKycStatus,
} from "../../lib/api/kyc/KycApi.interfaces";
import { EUserType, IUser } from "../../lib/api/users/interfaces";
import { IdentityRegistry } from "../../lib/contracts/IdentityRegistry";
import { TAppGlobalState } from "../../store";
import { actions, TActionFromCreator } from "../actions";
import { ensurePermissionsArePresentAndRunEffect } from "../auth/jwt/sagas";
import { selectIsUserVerified, selectUser, selectUserType } from "../auth/selectors";
import { userHasKycAndEmailVerified } from "../eto-flow/selectors";
import { displayErrorModalSaga } from "../generic-modal/sagas";
import { waitUntilSmartContractsAreInitialized } from "../init/sagas";
import { neuCall, neuTakeEvery, neuTakeUntil } from "../sagasUtils";
import { kycIdNowSagas } from "./instant-id/id-now/sagas";
import { kycOnfidoSagas } from "./instant-id/onfido/sagas";
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

function* kycRefreshWidgetSaga({ logger }: TGlobalDependencies): Generator<any, any, any> {
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
      yield put(actions.kyc.kycLoadStatusAndData());

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

    const loggedInUser: IUser = yield select((state: TAppGlobalState) => selectUser(state.auth));

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

function* submitPersonalDataSaga(
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
  { notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitPersonalData>,
): Generator<any, any, any> {
  try {
    const { data } = action.payload;
    yield neuCall(submitPersonalDataSaga, data);
  } catch (e) {
    notificationCenter.error(createMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA));

    logger.error("Failed to submit KYC individual data", e);
  }
}

function* submitPersonalData(
  { notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitPersonalData>,
): Generator<any, any, any> {
  try {
    const { data } = action.payload;
    yield neuCall(submitPersonalDataSaga, data);

    yield put(actions.routing.goToKYCIndividualAddress());
  } catch (e) {
    notificationCenter.error(createMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA));

    logger.error("Failed to submit KYC individual data", e);
  }
}

function* submitPersonalDataAndClose(
  { notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitPersonalDataAndClose>,
): Generator<any, any, any> {
  try {
    const { data } = action.payload;
    yield neuCall(submitPersonalDataSaga, data);

    yield put(actions.routing.goToDashboard());
  } catch (e) {
    notificationCenter.error(createMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA));

    logger.error("Failed to submit KYC individual data", e);
  }
}

function* submitPersonalAddressSaga(
  { apiKycService, notificationCenter, logger }: TGlobalDependencies,
  data: IKycIndividualData,
): Generator<any, any, any> {
  try {
    const result: IHttpResponse<IKycIndividualData> = yield apiKycService.putPersonalData({
      ...data,
      // TODO: Remove when not needed. This adds additional fields required by backend
      isHighIncome: false,
      isPoliticallyExposed: false,
    });

    yield put(actions.kyc.kycUpdateIndividualData(false, result.body));

    return true;
  } catch (e) {
    notificationCenter.error(createMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA));

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
    yield put(actions.routing.goToKYCIndividualDocumentVerification());
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
  { apiKycService, notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycUploadIndividualDocument>,
): Generator<any, any, any> {
  const { file } = action.payload;
  try {
    yield put(actions.kyc.kycUpdateIndividualDocument(true));
    const result: IHttpResponse<IKycFileInfo> = yield apiKycService.uploadIndividualDocument(file);
    yield put(actions.kyc.kycUpdateIndividualDocument(false, result.body));
    notificationCenter.info(createMessage(KycFlowMessage.KYC_UPLOAD_SUCCESSFUL));
  } catch (e) {
    yield put(actions.kyc.kycUpdateIndividualDocument(false));

    notificationCenter.error(createMessage(KycFlowMessage.KYC_UPLOAD_FAILED));

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

function* submitIndividualRequest({
  notificationCenter,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(submitIndividualRequestEffect),
      [EJwtPermissions.SUBMIT_KYC_PERMISSION],
      createMessage(KycFlowMessage.KYC_SUBMIT_TITLE),
      createMessage(KycFlowMessage.KYC_SUBMIT_DESCRIPTION),
    );
  } catch (e) {
    notificationCenter.error(createMessage(KycFlowMessage.KYC_SUBMIT_FAILED));

    logger.error("Failed to submit KYC individual request", e);
  }
}

/**
 * Company Request
 */

// legal representative
function* loadLegalRepresentative({
  apiKycService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateLegalRepresentative(true));
    const result: IHttpResponse<IKycLegalRepresentative> = yield apiKycService.getLegalRepresentative();
    yield put(actions.kyc.kycUpdateLegalRepresentative(false, result.body));
  } catch (e) {
    // TODO: There is something wrong here as reponse parsing error is thrown.
    // Will review the code and fix in the separate PR
    logger.error("Failed to load KYC representative", e);

    yield put(actions.kyc.kycUpdateLegalRepresentative(false));
  }
}

function* submitLegalRepresentative(
  { apiKycService, notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitLegalRepresentative>,
): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateLegalRepresentative(true));
    const result: IHttpResponse<IKycLegalRepresentative> = yield apiKycService.putLegalRepresentative(
      {
        ...action.payload.data,
        // TODO: Remove when not needed. This adds additional fields required by backend
        isHighIncome: false,
      },
    );
    yield put(actions.kyc.kycUpdateLegalRepresentative(false, result.body));
  } catch (e) {
    logger.error("Failed to submit KYC legal representative", e);

    yield put(actions.kyc.kycUpdateLegalRepresentative(false));
    notificationCenter.error(createMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA));
  }
}

function* uploadLegalRepresentativeFile(
  { apiKycService, notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycUploadLegalRepresentativeDocument>,
): Generator<any, any, any> {
  const { file } = action.payload;
  try {
    yield put(actions.kyc.kycUpdateLegalRepresentativeDocument(true));
    const result: IHttpResponse<IKycFileInfo> = yield apiKycService.uploadLegalRepresentativeDocument(
      file,
    );
    yield put(actions.kyc.kycUpdateLegalRepresentativeDocument(false, result.body));
  } catch (e) {
    logger.error("Failed to upload KYC legal representative file", e);

    yield put(actions.kyc.kycUpdateLegalRepresentativeDocument(false));

    notificationCenter.error(createMessage(KycFlowMessage.KYC_UPLOAD_FAILED));
  }
}

function* loadLegalRepresentativeFiles({
  apiKycService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateLegalRepresentativeDocuments(true));
    const result: IHttpResponse<IKycFileInfo[]> = yield apiKycService.getLegalRepresentativeDocuments();
    yield put(actions.kyc.kycUpdateLegalRepresentativeDocuments(false, result.body));
  } catch (e) {
    logger.error("Failed to load KYC legal representative file", e);

    yield put(actions.kyc.kycUpdateLegalRepresentativeDocuments(false));
  }
}

// business data
function* setBusinessType(
  { apiKycService, notificationCenter, logger }: TGlobalDependencies,
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

    notificationCenter.error(createMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA));

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
  { apiKycService, notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitBusinessData>,
): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateBusinessData(true));
    const result: IHttpResponse<IKycBusinessData> = yield apiKycService.putBusinessData(
      action.payload.data,
    );
    yield put(actions.kyc.kycUpdateBusinessData(false, result.body));
  } catch (e) {
    yield put(actions.kyc.kycUpdateBusinessData(false));

    notificationCenter.error(createMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA));

    logger.error("Failed to submit KYC business data", e);
  }
}

function* uploadBusinessFile(
  { apiKycService, notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycUploadBusinessDocument>,
): Generator<any, any, any> {
  const { file } = action.payload;
  try {
    yield put(actions.kyc.kycUpdateBusinessDocument(true));
    const result: IHttpResponse<IKycFileInfo> = yield apiKycService.uploadBusinessDocument(file);
    yield put(actions.kyc.kycUpdateBusinessDocument(false, result.body));
    notificationCenter.info(createMessage(KycFlowMessage.KYC_UPLOAD_SUCCESSFUL));
  } catch (e) {
    yield put(actions.kyc.kycUpdateBusinessDocument(false));

    notificationCenter.error(createMessage(KycFlowMessage.KYC_UPLOAD_FAILED));

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

// beneficial owners
function* loadBeneficialOwners({
  apiKycService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateBeneficialOwners(true));
    const result: IHttpResponse<IKycBeneficialOwner[]> = yield apiKycService.getBeneficialOwners();
    yield put(actions.kyc.kycUpdateBeneficialOwners(false, result.body));
  } catch (e) {
    yield put(actions.kyc.kycUpdateBeneficialOwners(false));

    logger.error("Failed to load KYC beneficial owners", e);
  }
}

function* createBeneficialOwner({
  apiKycService,
  notificationCenter,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateBeneficialOwner(true));
    const result: IHttpResponse<IKycBeneficialOwner> = yield apiKycService.postBeneficialOwner({});
    yield put(actions.kyc.kycUpdateBeneficialOwner(false, result.body.id, result.body));
  } catch (e) {
    yield put(actions.kyc.kycUpdateBeneficialOwner(false));

    notificationCenter.error(createMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA));

    logger.error("Failed to create KYC beneficial owner", e);
  }
}

function* submitBeneficialOwner(
  { apiKycService, notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitBeneficialOwner>,
): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateBeneficialOwner(true));
    const result: IHttpResponse<IKycBeneficialOwner> = yield apiKycService.putBeneficialOwner({
      ...action.payload.owner,
      // TODO: Remove when not needed. This adds additional fields required by backend
      isHighIncome: false,
    });
    yield put(actions.kyc.kycUpdateBeneficialOwner(false, result.body.id, result.body));
  } catch (e) {
    yield put(actions.kyc.kycUpdateBeneficialOwner(false));

    notificationCenter.error(createMessage(KycFlowMessage.KYC_PROBLEM_SAVING_DATA));

    logger.error("Failed to submit KYC beneficial owner", e);
  }
}

function* deleteBeneficialOwner(
  { apiKycService, notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycDeleteBeneficialOwner>,
): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateBeneficialOwner(true));
    yield apiKycService.deleteBeneficialOwner(action.payload.id);
    yield put(actions.kyc.kycUpdateBeneficialOwner(false, action.payload.id, undefined));
  } catch (e) {
    yield put(actions.kyc.kycUpdateBeneficialOwner(false));

    notificationCenter.error(createMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA));

    logger.error("Failed to delete KYC beneficial owner", e);
  }
}

function* uploadBeneficialOwnerFile(
  { apiKycService, notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycUploadBeneficialOwnerDocument>,
): Generator<any, any, any> {
  const { boid, file } = action.payload;
  try {
    yield put(actions.kyc.kycUpdateBeneficialOwnerDocument(boid, true));
    const result: IHttpResponse<IKycFileInfo> = yield apiKycService.uploadBeneficialOwnerDocument(
      boid,
      file,
    );
    yield put(actions.kyc.kycUpdateBeneficialOwnerDocument(boid, false, result.body));
    notificationCenter.info(createMessage(KycFlowMessage.KYC_UPLOAD_SUCCESSFUL));
  } catch (e) {
    yield put(actions.kyc.kycUpdateBeneficialOwnerDocument(boid, false));

    notificationCenter.error(createMessage(KycFlowMessage.KYC_UPLOAD_FAILED));

    logger.error("Failed to upload KYC beneficial owner file", e);
  }
}

function* loadBeneficialOwnerFiles(
  { apiKycService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycLoadBeneficialOwnerDocumentList>,
): Generator<any, any, any> {
  const { boid } = action.payload;
  try {
    yield put(actions.kyc.kycUpdateBeneficialOwnerDocuments(boid, true));
    const result: IHttpResponse<IKycFileInfo[]> = yield apiKycService.getBeneficialOwnerDocuments(
      boid,
    );
    yield put(actions.kyc.kycUpdateBeneficialOwnerDocuments(boid, false, result.body));
  } catch (e) {
    yield put(actions.kyc.kycUpdateBeneficialOwnerDocuments(boid, false));

    logger.error("Failed to load KYC beneficial owner file", e);
  }
}

// request
function* submitBusinessRequestEffect({
  apiKycService,
}: TGlobalDependencies): Generator<any, any, any> {
  const userType = yield select(selectUserType);
  const kycAndEmailVerified = yield select(userHasKycAndEmailVerified);

  const kycStatus: TKycStatus = yield apiKycService.submitBusinessRequest();

  yield put(actions.kyc.setStatus(kycStatus));

  const buttonAction =
    !kycAndEmailVerified && userType === EUserType.NOMINEE
      ? actions.routing.goToDashboard()
      : actions.routing.goToProfile();

  yield put(
    actions.genericModal.showGenericModal(
      createMessage(KycFlowMessage.KYC_VERIFICATION_TITLE),
      createMessage(KycFlowMessage.KYC_VERIFICATION_DESCRIPTION),
      undefined,
      createMessage(KycFlowMessage.KYC_SETTINGS_BUTTON),
      buttonAction,
    ),
  );
}

function* submitBusinessRequest({
  notificationCenter,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
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
    notificationCenter.error(createMessage(KycFlowMessage.KYC_SUBMIT_FAILED));

    logger.error("Failed to submit KYC business request", e);
  }
}

export function* loadBankAccountDetails({
  apiKycService,
  logger,
  notificationCenter,
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
    notificationCenter.error(createMessage(KycFlowMessage.KYC_PROBLEM_LOADING_BANK_DETAILS));

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

  yield fork(neuTakeEvery, actions.kyc.kycLoadBeneficialOwners, loadBeneficialOwners);
  yield fork(neuTakeEvery, actions.kyc.kycAddBeneficialOwner, createBeneficialOwner);
  yield fork(neuTakeEvery, actions.kyc.kycSubmitBeneficialOwner, submitBeneficialOwner);
  yield fork(neuTakeEvery, actions.kyc.kycDeleteBeneficialOwner, deleteBeneficialOwner);
  yield fork(neuTakeEvery, actions.kyc.kycUploadBeneficialOwnerDocument, uploadBeneficialOwnerFile);
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
    kycRefreshWidgetSaga,
  );

  // sub-sagas
  yield fork(kycOnfidoSagas);
  yield fork(kycIdNowSagas);
}
