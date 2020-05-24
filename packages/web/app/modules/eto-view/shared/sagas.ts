import { call, fork, neuFork, neuTakeOnly, put, race, select } from "@neufund/sagas";
import { EUserType } from "@neufund/shared-modules";
import { LOCATION_CHANGE } from "connected-react-router";
import { match } from "react-router";

import { appRoutes } from "../../../components/appRoutes";
import { EtoMessage } from "../../../components/translatedMessages/messages";
import { createNotificationMessage } from "../../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { EEtoState } from "../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { TAppGlobalState } from "../../../store";
import { EProcessState } from "../../../utils/enums/processStates";
import { actions, TActionFromCreator } from "../../actions";
import { selectUserType } from "../../auth/selectors";
import { shouldLoadBookbuildingStats } from "../../bookbuilding-flow/utils";
import { loadEtoWithCompanyAndContract } from "../../eto/sagas";
import { getEtoRefreshStrategies, raceStrategies } from "../../eto/sagas/watchEtosSetActionSaga";
import {
  selectEtoOnChainStateById,
  selectInvestorEtoWithCompanyAndContract,
} from "../../eto/selectors";
import {
  EETOStateOnChain,
  EEtoSubState,
  TEtoWithCompanyAndContractReadonly,
} from "../../eto/types";
import { webNotificationUIModuleApi } from "../../notification-ui/module";
import { TEtoViewByPreviewCodeMatch } from "../../routing/types";
import { neuCall, neuTakeEveryUntil, neuTakeLatest } from "../../sagasUtils";
import { etoViewInvestorSagas } from "../investor/sagas";
import { etoViewIssuerSagas } from "../issuer/sagas";
import { etoViewNomineeSagas } from "../nominee/sagas";
import { etoViewNotAuthSagas } from "../notAuth/sagas";
import { selectEtoViewData } from "./selectors";
import {
  EEtoViewCampaignOverviewType,
  TCampaignOverviewData,
  TCampaignOverviewParams,
  TEtoViewState,
} from "./types";
import {
  getTwitterData,
  shouldShowInvestmentTerms,
  shouldShowProspectusDisclaimer,
  shouldShowSlideshare,
  shouldShowSocialChannels,
  shouldShowTimeline,
  shouldShowYouTube,
} from "./utils";

export function* calculateEtoViewCampaignOverviewType(
  eto: TEtoWithCompanyAndContractReadonly,
): Generator<any, EEtoViewCampaignOverviewType, any> {
  const userType = yield select(selectUserType);
  const timedState = eto.contract && eto.contract.timedState;
  const subState = eto.subState;

  if (timedState) {
    if (userType === EUserType.ISSUER && timedState === EETOStateOnChain.Whitelist) {
      return EEtoViewCampaignOverviewType.WITH_STATS;
    } else if (
      timedState === EETOStateOnChain.Whitelist &&
      subState !== EEtoSubState.COUNTDOWN_TO_PUBLIC_SALE
    ) {
      return EEtoViewCampaignOverviewType.WITH_STATS;
    } else if (timedState >= 2) {
      //from public onwards
      return EEtoViewCampaignOverviewType.WITH_STATS;
    }
  }

  return EEtoViewCampaignOverviewType.WITHOUT_STATS;
}

export function* getCampaignOverviewData(
  eto: TEtoWithCompanyAndContractReadonly,
  viewAsUserType: EUserType,
): Generator<any, TCampaignOverviewParams, any> {
  const twitterData = yield* call(getTwitterData, eto.company);

  return {
    showTimeline: yield* call(shouldShowTimeline, eto),
    showDisclaimer: yield* call(shouldShowProspectusDisclaimer, eto),
    showYouTube: yield* call(shouldShowYouTube, eto.company),
    showSlideshare: yield* call(shouldShowSlideshare, eto.company),
    showSocialChannels: yield* call(shouldShowSocialChannels, eto.company),
    showInvestmentTerms: yield* call(shouldShowInvestmentTerms, eto, viewAsUserType),
    ...twitterData,
  };
}

export function* calculateCampaignOverviewDataIssuerNominee(
  eto: TEtoWithCompanyAndContractReadonly,
): Generator<any, TCampaignOverviewData, any> {
  const campaignOverviewType: EEtoViewCampaignOverviewType = yield call(
    calculateEtoViewCampaignOverviewType,
    eto,
  );
  const campaignOverviewCommonData = yield call(getCampaignOverviewData, eto, EUserType.ISSUER);

  if (campaignOverviewType === EEtoViewCampaignOverviewType.WITH_STATS) {
    return {
      campaignOverviewType,
      ...campaignOverviewCommonData,
      url: appRoutes.etoIssuerView,
      path: appRoutes.etoIssuerView,
    };
  } else {
    return {
      campaignOverviewType,
      ...campaignOverviewCommonData,
      url: appRoutes.etoIssuerView,
    };
  }
}

export function* calculateCampaignOverviewData(
  routeMatch: match<TEtoViewByPreviewCodeMatch | {}>,
  eto: TEtoWithCompanyAndContractReadonly,
): Generator<any, TCampaignOverviewData, any> {
  const campaignOverviewType: EEtoViewCampaignOverviewType = yield call(
    calculateEtoViewCampaignOverviewType,
    eto,
  );

  const campaignOverviewCommonData = yield call(getCampaignOverviewData, eto, EUserType.INVESTOR);

  if (campaignOverviewType === EEtoViewCampaignOverviewType.WITH_STATS) {
    return {
      campaignOverviewType,
      ...campaignOverviewCommonData,
      url: routeMatch.url,
      path: routeMatch.path,
    };
  } else {
    return {
      campaignOverviewType,
      ...campaignOverviewCommonData,
      url: routeMatch.url,
    };
  }
}

export function* saveEto(eto: TEtoWithCompanyAndContractReadonly): Generator<any, void, any> {
  if (eto.contract) {
    yield put(actions.eto.setEtoDataFromContract(eto.previewCode, eto.contract));
  }
  yield put(actions.eto.setEto({ eto, company: eto.company }));
}

export function* etoFlowBackwardsCompat(
  eto: TEtoWithCompanyAndContractReadonly,
): Generator<any, void, any> {
  // save various pieces of data for backwards compatibility with other flows, e.g. investment
  yield call(saveEto, eto);
  const onChainState: EETOStateOnChain | undefined = yield select((state: TAppGlobalState) =>
    selectEtoOnChainStateById(state, eto.etoId),
  );

  if (shouldLoadBookbuildingStats(eto.state, onChainState)) {
    yield put(actions.bookBuilding.loadBookBuildingStats(eto.etoId));
  }
}

export function* reloadEtoView({ logger }: TGlobalDependencies): Generator<any, void, any> {
  try {
    const oldEtoViewData: TEtoViewState = yield select(selectEtoViewData);

    if (oldEtoViewData.processState !== EProcessState.SUCCESS) {
      return;
    }

    const eto: TEtoWithCompanyAndContractReadonly = yield neuCall(
      loadEtoWithCompanyAndContract,
      oldEtoViewData.eto.previewCode,
    );

    yield* performLoadEtoSideEffects(eto);

    const etoData = {
      ...oldEtoViewData,
      eto,
    };

    yield put(actions.etoView.setEtoViewData(etoData));
  } catch (e) {
    logger.error("Could not reload eto by preview code", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(EtoMessage.COULD_NOT_LOAD_ETO_PREVIEW),
      ),
    );
    yield put(actions.routing.goToDashboard());
  }
}

export function* performLoadEtoSideEffects(
  eto: TEtoWithCompanyAndContractReadonly,
): Generator<any, void, any> {
  yield* etoFlowBackwardsCompat(eto);

  const userType: EUserType | undefined = yield select((state: TAppGlobalState) =>
    selectUserType(state),
  );

  if (userType === EUserType.INVESTOR && eto.state === EEtoState.ON_CHAIN) {
    yield put(actions.investorEtoTicket.loadEtoInvestorTicket(eto));
  }
}

export function* etoViewDelay(
  _: TGlobalDependencies,
  previewCode: string,
): Generator<any, void, any> {
  const eto: TEtoWithCompanyAndContractReadonly = yield select((state: TAppGlobalState) =>
    selectInvestorEtoWithCompanyAndContract(state, previewCode),
  );
  const strategies = yield* neuCall(getEtoRefreshStrategies, eto);
  yield race(raceStrategies(strategies));
  yield put(actions.etoView.reloadEtoView());
}

function* watchSetEtoViewAction(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.etoView.setEtoViewData>,
): Generator<any, void, any> {
  const previewCode = action.payload.etoData.eto.previewCode;
  yield race({
    wait: neuFork(etoViewDelay, previewCode),
    cancel: neuTakeOnly(actions.etoView.setEtoViewData, { etoData: { eto: { previewCode } } }),
  });
}

export function* etoViewSagas(): Generator<any, void, any> {
  yield* etoViewNotAuthSagas();
  yield* etoViewIssuerSagas();
  yield* etoViewInvestorSagas();
  yield* etoViewNomineeSagas();
  yield fork(neuTakeLatest, actions.etoView.reloadEtoView, reloadEtoView);
  yield fork(
    neuTakeEveryUntil,
    actions.etoView.setEtoViewData,
    LOCATION_CHANGE,
    watchSetEtoViewAction,
  );
}
