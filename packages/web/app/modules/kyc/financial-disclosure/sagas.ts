import { put } from "@neufund/sagas";

import { KycFlowMessage } from "../../../components/translatedMessages/messages";
import { createNotificationMessage } from "../../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { actions, TActionFromCreator } from "../../actions";
import { webNotificationUIModuleApi } from "../../notification-ui/module";
import { neuCall } from "../../sagasUtils";
import { submitPersonalDataSaga } from "../sagas";

export function* submitFinancialDisclosure(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.kyc.kycSubmitFinancialDisclosure>,
): Generator<any, void, void> {
  try {
    const { data, close } = action.payload;
    yield* neuCall(submitPersonalDataSaga, data);

    if (close) {
      yield put(actions.routing.goToDashboard());
    } else {
      yield put(actions.routing.goToKYCIndividualDocumentVerification());
    }
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(KycFlowMessage.KYC_PROBLEM_SENDING_DATA),
      ),
    );

    logger.error("Failed to submit KYC individual data", e);
  }
}
