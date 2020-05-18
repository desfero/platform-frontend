import { call, delay, fork, put, select, take } from "@neufund/sagas";
import { EJwtPermissions, IHttpResponse } from "@neufund/shared-modules";

import { BookbuildingFlowMessage } from "../../components/translatedMessages/messages";
import {
  createMessage,
  createNotificationMessage,
} from "../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../di/setupBindings";
import { EtoPledgeNotFound, EtoPledgesNotFound } from "../../lib/api/eto/EtoPledgeApi";
import { IBookBuildingStats, IPledge } from "../../lib/api/eto/EtoPledgeApi.interfaces.unsafe";
import { TAppGlobalState } from "../../store";
import { actions, TActionFromCreator } from "../actions";
import { ensurePermissionsArePresentAndRunEffect } from "../auth/jwt/sagas";
import { etoNormalPollingDelay } from "../eto/constants";
import { selectEtoById, selectEtoOnChainStateById } from "../eto/selectors";
import { EETOStateOnChain } from "../eto/types";
import { webNotificationUIModuleApi } from "../notification-ui/module";
import { neuCall, neuTakeEvery, neuTakeLatestUntil } from "../sagasUtils";
import { canLoadPledges, shouldLoadBookbuildingStats } from "./utils";

export function* saveMyPledgeEffect(
  { apiEtoPledgeService }: TGlobalDependencies,
  etoId: string,
  pledge: IPledge,
): Generator<any, any, any> {
  const pledgeResult: IHttpResponse<IPledge> = yield apiEtoPledgeService.saveMyPledge(
    etoId,
    pledge,
  );

  yield put(actions.bookBuilding.setPledge(etoId, pledgeResult.body));
  yield put(actions.bookBuilding.loadBookBuildingStats(etoId));
}

export function* saveMyPledge(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.bookBuilding.savePledge>,
): Generator<any, any, any> {
  const { etoId, pledge } = action.payload;

  try {
    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(saveMyPledgeEffect, etoId, pledge),
      [EJwtPermissions.DO_BOOK_BUILDING],
      createMessage(BookbuildingFlowMessage.PLEDGE_FLOW_CONFIRM_PLEDGE),
      createMessage(BookbuildingFlowMessage.PLEDGE_FLOW_PLEDGE_DESCRIPTION),
    );
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(BookbuildingFlowMessage.PLEDGE_FLOW_FAILED_TO_SAVE_PLEDGE),
      ),
    );
    logger.error(`Failed to save pledge`, e);
  }
}

export function* deleteMyPledgeEffect(
  { apiEtoPledgeService }: TGlobalDependencies,
  etoId: string,
): any {
  yield apiEtoPledgeService.deleteMyPledge(etoId);

  yield put(actions.bookBuilding.setPledge(etoId));
  yield put(actions.bookBuilding.loadBookBuildingStats(etoId));
}

export function* deleteMyPledge(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.bookBuilding.deletePledge>,
): Generator<any, any, any> {
  const { etoId } = action.payload;
  try {
    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(deleteMyPledgeEffect, etoId),
      [EJwtPermissions.DO_BOOK_BUILDING],
      createMessage(BookbuildingFlowMessage.PLEDGE_FLOW_CONFIRM_PLEDGE_REMOVAL),
      createMessage(BookbuildingFlowMessage.PLEDGE_FLOW_CONFIRM_PLEDGE_REMOVAL_DESCRIPTION),
    );
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(BookbuildingFlowMessage.PLEDGE_FLOW_PLEDGE_REMOVAL_FAILED),
      ),
    );
    logger.error(`Failed to delete pledge`, e);
  }
}

export function* watchBookBuildingStats(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.bookBuilding.bookBuildingStartWatch>,
): Generator<any, any, any> {
  while (true) {
    logger.info("Querying for bookbuilding stats...");
    try {
      yield neuCall(
        loadBookBuildingStats,
        actions.bookBuilding.loadBookBuildingStats(action.payload.etoId),
      );
    } catch (e) {
      logger.error("Error getting bookbuilding stats", e);
    }
    yield take(actions.web3.newBlockArrived.getType());
  }
}

export function* loadBookBuildingStats(
  { apiEtoService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.bookBuilding.loadBookBuildingStats>,
): Generator<any, any, any> {
  try {
    const etoId = action.payload.etoId;
    const statsResponse: IHttpResponse<any> = yield apiEtoService.getBookBuildingStats(etoId);

    yield put(actions.bookBuilding.setBookBuildingStats(etoId, statsResponse.body));
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(
          BookbuildingFlowMessage.PLEDGE_FLOW_FAILED_TO_GET_BOOKBUILDING_STATS,
        ),
      ),
    );

    logger.error(`Failed to load bookbuilding stats pledge`, e);
  }
}

export function* loadBookBuildingListStats(
  { apiEtoService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.bookBuilding.loadBookBuildingListStats>,
): Generator<any, any, any> {
  try {
    const etosIds = action.payload.etosIds;

    // there are some edge cases where eto list is empty
    // therefore there is no need to fetch in batch bookbuilding stats
    if (etosIds.length === 0) {
      logger.info("No ETO's to load bookbuilding stats for");

      return;
    }

    const statsListResponse: Record<
      string,
      IBookBuildingStats
    > = yield apiEtoService.getBookBuildingStatsList(etosIds);

    yield put(actions.bookBuilding.setBookBuildingListStats(statsListResponse));
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(
          BookbuildingFlowMessage.PLEDGE_FLOW_FAILED_TO_GET_BOOKBUILDING_STATS,
        ),
      ),
    );

    logger.error(`Failed to load bookbuilding stats pledge`, e);
  }
}

export function* loadPledgeForEto(
  { apiEtoPledgeService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.bookBuilding.loadPledgeForEto>,
): Generator<any, any, any> {
  try {
    const { etoId } = action.payload;
    const canLoadPledgesResult = yield* call(canLoadPledges);

    if (canLoadPledgesResult) {
      const eto = yield* select((state: TAppGlobalState) => selectEtoById(state, etoId));
      const onChainState: EETOStateOnChain | undefined = yield* select((state: TAppGlobalState) =>
        selectEtoOnChainStateById(state, etoId),
      );

      if (eto && shouldLoadBookbuildingStats(eto.state, onChainState)) {
        const pledgeResponse: IHttpResponse<IPledge> = yield apiEtoPledgeService.getPledgeForEto(
          etoId,
        );
        yield put(actions.bookBuilding.setPledge(etoId, pledgeResponse.body));
      }
    }
  } catch (e) {
    if (!(e instanceof EtoPledgeNotFound)) {
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(BookbuildingFlowMessage.PLEDGE_FLOW_FAILED_TO_LOAD_PLEDGE),
        ),
      );
      logger.error("Failed to load pledge", e);
    }
  }
}

export function* loadAllMyPledges({
  apiEtoPledgeService,
  logger,
}: TGlobalDependencies): Generator<any, void, any> {
  try {
    const canLoadPledgesResult = yield* call(canLoadPledges);

    if (canLoadPledgesResult) {
      const pledges = yield* call(() => apiEtoPledgeService.getAllMyPledges());
      yield put(actions.bookBuilding.setPledges(pledges));
    }
  } catch (e) {
    if (!(e instanceof EtoPledgesNotFound)) {
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(BookbuildingFlowMessage.PLEDGE_FLOW_FAILED_TO_LOAD_PLEDGE),
        ),
      );

      logger.error("Failed to load pledges", e);
    }
  }
}

export function* watchPledges(): Generator<any, void, void> {
  while (true) {
    yield delay(etoNormalPollingDelay);
    yield put(actions.bookBuilding.loadAllPledges());
  }
}

export function* bookBuildingFlowSagas(): Generator<any, any, any> {
  yield fork(neuTakeEvery, actions.bookBuilding.loadBookBuildingStats, loadBookBuildingStats);
  yield fork(
    neuTakeLatestUntil,
    actions.bookBuilding.bookBuildingStartWatch,
    actions.bookBuilding.bookBuildingStopWatch,
    watchBookBuildingStats,
  );
  yield fork(
    neuTakeEvery,
    actions.bookBuilding.loadBookBuildingListStats,
    loadBookBuildingListStats,
  );
  yield fork(neuTakeEvery, actions.bookBuilding.loadPledgeForEto, loadPledgeForEto);
  yield fork(neuTakeEvery, actions.bookBuilding.loadAllPledges, loadAllMyPledges);
  yield fork(neuTakeEvery, actions.bookBuilding.savePledge, saveMyPledge);
  yield fork(neuTakeEvery, actions.bookBuilding.deletePledge, deleteMyPledge);
  yield fork(watchPledges);
}
