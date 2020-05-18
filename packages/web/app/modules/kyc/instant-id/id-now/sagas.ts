import { fork, put } from "@neufund/sagas";

import { KycFlowMessage } from "../../../../components/translatedMessages/messages";
import { createNotificationMessage } from "../../../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../../../di/setupBindings";
import { TKycIdNowIdentification } from "../../../../lib/api/kyc/KycApi.interfaces";
import { actions } from "../../../actions";
import { webNotificationUIModuleApi } from "../../../notification-ui/module";
import { neuTakeEvery } from "../../../sagasUtils";

function* startIdNow({ apiKycService, logger }: TGlobalDependencies): Generator<any, any, any> {
  try {
    const { redirectUrl }: TKycIdNowIdentification = yield apiKycService.startInstantId();

    yield put(actions.routing.openInNewWindow(redirectUrl));
    yield put(actions.kyc.setIdNowRedirectUrl(redirectUrl));

    yield put(actions.kyc.kycLoadStatusAndData());
  } catch (e) {
    logger.error("KYC instant id-now failed to start", e);

    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_SUBMIT_FAILED),
      ),
    );
  }
}
export function* kycIdNowSagas(): Generator<any, any, any> {
  yield fork(neuTakeEvery, actions.kyc.startIdNowRequest, startIdNow);
}
