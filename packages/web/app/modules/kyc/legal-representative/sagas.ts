import { put } from "@neufund/sagas";

import { KycFlowMessage } from "../../../components/translatedMessages/messages";
import { createMessage } from "../../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { IHttpResponse } from "../../../lib/api/client/IHttpClient";
import { IKycFileInfo, IKycLegalRepresentative } from "../../../lib/api/kyc/KycApi.interfaces";
import { actions, TActionFromCreator } from "../../actions";

export function* loadLegalRepresentative({
  apiKycService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateLegalRepresentative(true));
    const result: IHttpResponse<IKycLegalRepresentative> = yield apiKycService.getLegalRepresentative();
    yield put(actions.kyc.kycUpdateLegalRepresentative(false, result.body));
  } catch (e) {
    logger.error("Failed to load KYC representative", e);

    yield put(actions.kyc.kycUpdateLegalRepresentative(false));
  }
}

export function* submitLegalRepresentative(
  { apiKycService, notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitLegalRepresentative>,
): Generator<any, any, any> {
  try {
    yield put(actions.kyc.kycUpdateLegalRepresentative(true));
    const result: IHttpResponse<IKycLegalRepresentative> = yield apiKycService.putLegalRepresentative(
      {
        ...action.payload.data,
        // TODO: Remove when not needed. This adds additional fields required by backend
        isPoliticallyExposed:
          action.payload.data.isPoliticallyExposed !== true &&
          action.payload.data.isPoliticallyExposed !== false
            ? undefined
            : action.payload.data.isPoliticallyExposed,
        isHighIncome: false,
      },
    );
    yield put(actions.kyc.kycUpdateLegalRepresentative(false, result.body));
    yield put(actions.kyc.toggleLegalRepresentativeModal(false));
  } catch (e) {
    logger.error("Failed to submit KYC legal representative", e);

    yield put(actions.kyc.kycUpdateLegalRepresentative(false));
    notificationCenter.error(createMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA));
  }
}

export function* uploadLegalRepresentativeFile(
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

export function* loadLegalRepresentativeFiles({
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
