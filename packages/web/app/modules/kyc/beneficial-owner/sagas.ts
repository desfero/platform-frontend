import { actionChannel, put, select, take } from "@neufund/sagas";
import { IHttpResponse } from "@neufund/shared-modules";

import { KycFlowMessage } from "../../../components/translatedMessages/messages";
import { createNotificationMessage } from "../../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../../di/setupBindings";
import {
  IKycBeneficialOwner,
  IKYCBeneficialOwnerBusiness,
  IKYCBeneficialOwnerPerson,
  IKycFileInfo,
} from "../../../lib/api/kyc/KycApi.interfaces";
import { TAppGlobalState } from "../../../store";
import { actions, TActionFromCreator } from "../../actions";
import { webNotificationUIModuleApi } from "../../notification-ui/module";
import { neuCall } from "../../sagasUtils";
import { selectEditingBeneficiaryId } from "../selectors";
import { getBeneficialOwnerId } from "../utils";

// TODO: Remove when not needed. This adds additional fields required by backend
const ownerRequestObjectTransform = (owner: IKycBeneficialOwner): IKycBeneficialOwner => ({
  ...owner,
  ownership: 1,
});

export function* loadBeneficialOwners({
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

export function* updateBeneficialOwner(
  { apiKycService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitBeneficialOwner>,
): Generator<any, any, any> {
  const { owner, id } = action.payload;

  try {
    if (owner.person) {
      (owner.person as IKYCBeneficialOwnerPerson).id = id;
    } else {
      (owner.business as IKYCBeneficialOwnerBusiness).id = id;
    }

    yield put(actions.kyc.kycUpdateBeneficialOwner(true));
    const result: IHttpResponse<IKycBeneficialOwner> = yield apiKycService.putBeneficialOwner(
      ownerRequestObjectTransform(owner),
    );
    yield put(
      actions.kyc.kycUpdateBeneficialOwner(false, getBeneficialOwnerId(result.body), result.body),
    );
    yield put(actions.kyc.kycToggleBeneficialOwnerModal(false));
  } catch (e) {
    yield put(actions.kyc.kycUpdateBeneficialOwner(false));

    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_PROBLEM_SAVING_DATA),
      ),
    );

    logger.error("Failed to submit KYC beneficial owner", e);
  }
}

export function* deleteBeneficialOwner(
  { apiKycService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycDeleteBeneficialOwner>,
): Generator<any, any, any> {
  const beneficialOwnerId = action.payload.id;
  try {
    yield put(actions.kyc.kycUpdateBeneficialOwner(true));
    yield apiKycService.deleteBeneficialOwner(beneficialOwnerId);
    yield put(actions.kyc.kycToggleBeneficialOwnerModal(false));
    yield put(actions.kyc.kycUpdateBeneficialOwner(false, beneficialOwnerId, undefined));
  } catch (e) {
    yield put(actions.kyc.kycUpdateBeneficialOwner(false));

    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA),
      ),
    );

    logger.error("Failed to delete KYC beneficial owner", e);
  }
}

export function* uploadBeneficialOwnerFile(
  { apiKycService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycUploadBeneficialOwnerDocument>,
): Generator<any, any, any> {
  const state: TAppGlobalState = yield* select();
  const { file, values } = action.payload;
  let boId = selectEditingBeneficiaryId(state);

  if (!boId) {
    // TODO move to separate func
    yield put(actions.kyc.kycUpdateBeneficialOwner(true));
    const result: IHttpResponse<IKycBeneficialOwner> = yield apiKycService.postBeneficialOwner(
      ownerRequestObjectTransform(values),
    );
    boId = getBeneficialOwnerId(result.body);
    yield put(actions.kyc.kycUpdateBeneficialOwner(false, boId, result.body));
    yield put(actions.kyc.kycToggleBeneficialOwnerModal(true, boId));
  }

  try {
    yield put(actions.kyc.kycUpdateBeneficialOwnerDocument(boId, true));
    const result: IHttpResponse<IKycFileInfo> = yield apiKycService.uploadBeneficialOwnerDocument(
      boId,
      file,
    );
    yield put(actions.kyc.kycUpdateBeneficialOwnerDocument(boId, false, result.body));
    yield put(
      webNotificationUIModuleApi.actions.showInfo(
        createNotificationMessage(KycFlowMessage.KYC_UPLOAD_SUCCESSFUL),
      ),
    );
  } catch (e) {
    yield put(actions.kyc.kycUpdateBeneficialOwnerDocument(boId, false));

    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_UPLOAD_FAILED),
      ),
    );

    logger.error("Failed to upload KYC beneficial owner file", e);
  }
}

export function* throttledKycUploadBeneficialOwnerDocument(): Generator<any, any, any> {
  const channel = yield actionChannel(actions.kyc.kycUploadBeneficialOwnerDocument);
  while (true) {
    const action = yield take(channel);
    yield neuCall(uploadBeneficialOwnerFile, action);
  }
}

export function* loadBeneficialOwnerFiles(
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

export function* toggleBeneficialOwnerModal(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycToggleBeneficialOwnerModal>,
): Generator<any, any, any> {
  const { boId } = action.payload;
  if (boId) {
    yield put(actions.kyc.kycLoadBeneficialOwnerDocumentList(boId));
  }
}
