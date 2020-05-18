import { all, call, fork, put, select, take } from "@neufund/sagas";

import { EtoMessage } from "../../../components/translatedMessages/messages";
import { createNotificationMessage } from "../../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { actions } from "../../actions";
import { selectIsUserVerifiedOnBlockchain } from "../../kyc/selectors";
import { loadActiveNomineeEto } from "../../nominee-flow/sagas";
import {
  selectActiveNomineeEto,
  selectNomineeActiveEtoPreviewCode,
} from "../../nominee-flow/selectors";
import { webNotificationUIModuleApi } from "../../notification-ui/module";
import { neuCall, neuTakeEvery } from "../../sagasUtils";
import {
  calculateCampaignOverviewDataIssuerNominee,
  performLoadEtoSideEffects,
} from "../shared/sagas";
import { EEtoViewType, TCampaignOverviewData } from "../shared/types";

export function* loadNomineeEtoView({ logger }: TGlobalDependencies): Generator<any, void, any> {
  yield put(actions.etoView.resetEtoViewData());
  try {
    let activeNomineeEtoPreviewCode = yield select(selectNomineeActiveEtoPreviewCode);

    if (activeNomineeEtoPreviewCode === undefined) {
      yield all([
        neuCall(loadActiveNomineeEto),
        take(actions.nomineeFlow.setActiveNomineeEtoPreviewCode),
      ]);
      activeNomineeEtoPreviewCode = yield select(selectNomineeActiveEtoPreviewCode);
    }

    if (activeNomineeEtoPreviewCode === undefined) {
      return yield put(actions.routing.goToDashboard());
    }

    const eto = yield select(selectActiveNomineeEto);

    if (eto) {
      const userIsFullyVerified = yield select(selectIsUserVerifiedOnBlockchain);
      const etoViewType = EEtoViewType.ETO_VIEW_NOT_AUTHORIZED;
      const campaignOverviewData: TCampaignOverviewData = yield call(
        calculateCampaignOverviewDataIssuerNominee,
        eto,
      );

      yield* performLoadEtoSideEffects(eto);
      yield put(actions.bookBuilding.loadPledgeForEto(eto.etoId));

      yield put(
        actions.etoView.setEtoViewData({
          eto,
          campaignOverviewData,
          userIsFullyVerified,
          etoViewType,
        }),
      );
    }
  } catch (e) {
    logger.error("Could not load nominee eto", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(EtoMessage.COULD_NOT_LOAD_ETO_PREVIEW),
      ),
    );
    yield put(actions.routing.goToDashboard());
  }
}

export function* etoViewNomineeSagas(): Generator<any, void, any> {
  yield fork(neuTakeEvery, actions.etoView.loadNomineeEtoView, loadNomineeEtoView);
}
