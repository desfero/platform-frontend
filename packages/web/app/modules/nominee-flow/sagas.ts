import { all, fork, put, select, take } from "@neufund/sagas";
import { walletApi } from "@neufund/shared-modules";
import { Dictionary, InvariantError, nonNullable } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";
import { cloneDeep, isEmpty } from "lodash/fp";

import { hashFromIpfsLink } from "../../components/documents/utils";
import { getNomineeRequestComponentState } from "../../components/nominee-dashboard/linkToIssuer/utils";
import {
  EEtoNomineeActiveEtoNotifications,
  ENomineeRequestErrorNotifications,
  EtoMessage,
} from "../../components/translatedMessages/messages";
import { createNotificationMessage } from "../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../di/setupBindings";
import { EEtoState, TNomineeRequestResponse } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { IssuerIdInvalid, NomineeRequestExists } from "../../lib/api/eto/EtoNomineeApi";
import { ETOCommitment } from "../../lib/contracts/ETOCommitment";
import { actions, TActionFromCreator } from "../actions";
import { selectIsUserFullyVerified } from "../auth/selectors";
import { selectIsBankAccountVerified } from "../bank-transfer-flow/selectors";
import {
  getEtoContract,
  loadAgreementsStatus,
  loadCapitalIncrease,
  loadInvestmentAgreement,
} from "../eto/sagas";
import { selectEtoSubStateEtoEtoWithContract } from "../eto/selectors";
import { EEtoAgreementStatus, EETOStateOnChain, TEtoWithCompanyAndContract } from "../eto/types";
import { isOnChain } from "../eto/utils";
import { loadBankAccountDetails } from "../kyc/sagas";
import { webNotificationUIModuleApi } from "../notification-ui/module";
import {
  neuCall,
  neuTakeEvery,
  neuTakeLatest,
  neuTakeLatestUntil,
  neuTakeOnly,
} from "../sagasUtils";
import { EAgreementType } from "../tx/transactions/nominee/sign-agreement/types";
import {
  initalNomineeTaskStatus,
  initialEtoSpecificTaskData,
  initialNomineeEtoSpecificTaskStatus,
} from "./reducer";
import {
  selectActiveEtoPreviewCodeFromQueryString,
  selectActiveNomineeEto,
  selectEtoSpecificTaskData,
  selectEtoSpecificTasksStatus,
  selectIsISHASignedByIssuer,
  selectNomineeActiveEtoPreviewCode,
  selectNomineeEtoDocumentsStatus,
  selectNomineeEtos,
  selectNomineeRequestError,
  selectNomineeRequests,
  selectNomineeTasksData,
  selectNomineeTasksStatus,
} from "./selectors";
import {
  ENomineeEtoSpecificTask,
  ENomineeFlowError,
  ENomineeRequestError,
  ENomineeTask,
  ENomineeTaskStatus,
  ERedeemShareCapitalTaskSubstate,
  INomineeRequest,
  TNomineeEtoSpecificTasksStatus,
  TNomineeRequestStorage,
} from "./types";
import {
  generateIpfsHash,
  getNomineeTaskStep,
  nomineeApiDataToNomineeRequests,
  nomineeRequestResponseToRequestStatus,
  takeLatestNomineeRequest,
} from "./utils";

export function* initNomineeEtoSpecificTasks(
  { logger }: TGlobalDependencies,
  eto: TEtoWithCompanyAndContract,
): Generator<any, any, any> {
  try {
    const nomineeEtoSpecificTasks = {
      [ENomineeEtoSpecificTask.ACCEPT_THA]: ENomineeTaskStatus.NOT_DONE,
      [ENomineeEtoSpecificTask.ACCEPT_RAAA]: ENomineeTaskStatus.NOT_DONE,
      [ENomineeEtoSpecificTask.REDEEM_SHARE_CAPITAL]: ENomineeTaskStatus.NOT_DONE,
      [ENomineeEtoSpecificTask.ACCEPT_ISHA]: ENomineeTaskStatus.NOT_DONE,
    };

    if (isOnChain(eto)) {
      yield put(actions.nomineeFlow.nomineeLoadEtoAgreementsStatus(eto));
      yield neuTakeOnly(actions.nomineeFlow.nomineeSetAgreementsStatus, {
        previewCode: eto.previewCode,
      } as any);

      const documentsStatus: ReturnType<typeof selectNomineeEtoDocumentsStatus> = yield select(
        selectNomineeEtoDocumentsStatus,
        eto.previewCode,
      );

      if (!documentsStatus) {
        throw new InvariantError("Eto documents should be defined at this point");
      }

      if (documentsStatus[EAgreementType.THA] === EEtoAgreementStatus.DONE) {
        nomineeEtoSpecificTasks[ENomineeEtoSpecificTask.ACCEPT_THA] = ENomineeTaskStatus.DONE;
      }

      if (documentsStatus[EAgreementType.RAAA] === EEtoAgreementStatus.DONE) {
        nomineeEtoSpecificTasks[ENomineeEtoSpecificTask.ACCEPT_RAAA] = ENomineeTaskStatus.DONE;
      }
    }

    if (isOnChain(eto) && eto.contract.timedState >= EETOStateOnChain.Signing) {
      yield neuCall(
        nomineeFlowLoadInvestmentAgreement,
        actions.nomineeFlow.nomineeLoadSignedInvestmentAgreement(eto.etoId, eto.previewCode),
      );

      const ishaIsSignedByIssuer = yield select(selectIsISHASignedByIssuer, eto.previewCode);
      if (ishaIsSignedByIssuer) {
        nomineeEtoSpecificTasks[ENomineeEtoSpecificTask.REDEEM_SHARE_CAPITAL] =
          ENomineeTaskStatus.DONE;
      }
    }

    if (isOnChain(eto) && eto.contract.timedState > EETOStateOnChain.Signing) {
      nomineeEtoSpecificTasks[ENomineeEtoSpecificTask.ACCEPT_ISHA] = ENomineeTaskStatus.DONE;
    }

    return nomineeEtoSpecificTasks;
  } catch (e) {
    logger.error("error in initNomineeTasks", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(ENomineeRequestErrorNotifications.FETCH_NOMINEE_DATA_ERROR),
      ),
    );
  }
}

export function* getDataAndInitNomineeTasks(_: TGlobalDependencies): Generator<any, any, any> {
  const nomineeTasksStatus = cloneDeep(initalNomineeTaskStatus);

  const userIsVerified: ReturnType<typeof selectIsUserFullyVerified> = yield select(
    selectIsUserFullyVerified,
  );
  if (!userIsVerified) {
    yield put(actions.nomineeFlow.storeNomineeTasksStatus(nomineeTasksStatus)); //no reason to go further
    return;
  } else {
    nomineeTasksStatus[ENomineeTask.ACCOUNT_SETUP] = ENomineeTaskStatus.DONE;

    yield all([neuCall(loadBankAccountDetails), neuCall(loadNomineeEtos)]);

    const {
      bankAccountIsVerified,
      nomineeEtos,
    }: {
      bankAccountIsVerified: ReturnType<typeof selectIsBankAccountVerified>;
      nomineeEtos: ReturnType<typeof selectNomineeEtos>;
    } = yield all({
      bankAccountIsVerified: select(selectIsBankAccountVerified),
      nomineeEtos: select(selectNomineeEtos),
    });

    if (bankAccountIsVerified) {
      nomineeTasksStatus[ENomineeTask.LINK_BANK_ACCOUNT] = ENomineeTaskStatus.DONE;
    }

    if (isEmpty(nomineeEtos)) {
      yield put(actions.nomineeFlow.storeNomineeTasksStatus(nomineeTasksStatus));
      return;
    } else {
      nomineeTasksStatus[ENomineeTask.LINK_TO_ISSUER] = ENomineeTaskStatus.DONE;
    }

    const etoSpecificNomineeTaskStatusEffects = Object.values(nomineeEtos).reduce<{
      [key: string]: Generator<any, any, any>;
    }>(
      (
        effects: { [key: string]: Generator<any, any, any> },
        eto: TEtoWithCompanyAndContract | undefined,
      ) => {
        if (!eto) {
          throw new InvariantError("Eto should be defined at this point");
        }

        return {
          ...effects,
          [eto.previewCode]: neuCall(initNomineeEtoSpecificTasks, eto),
        };
      },
      {},
    );

    nomineeTasksStatus.byPreviewCode = yield all(etoSpecificNomineeTaskStatusEffects);

    yield put(actions.nomineeFlow.storeNomineeTasksStatus(nomineeTasksStatus));
  }
}

export function* initNomineeDashboardView(): Generator<any, any, any> {
  yield neuCall(getDataAndInitNomineeTasks);

  const nomineeTasksStatus = yield select(selectNomineeTasksStatus);

  //check the conditions and start watchers  here
  const verificationIsComplete = yield select(selectIsUserFullyVerified);

  if (verificationIsComplete) {
    yield all({
      startRequestWatcher: put(actions.nomineeFlow.startNomineeRequestsWatcher()),
      setActiveEto: neuCall(setActiveNomineeEto),
    });
  }
  const selectStepData = yield all({
    activeEtoPreviewCode: select(selectNomineeActiveEtoPreviewCode),
    nomineeEtos: select(selectNomineeEtos),
  });

  const activeNomineeTask: ENomineeTask | ENomineeEtoSpecificTask = yield getNomineeTaskStep({
    ...selectStepData,
    nomineeTasksStatus,
  });

  const taskSpecificData = yield neuCall(getTaskSpecificData, activeNomineeTask);

  yield put(actions.nomineeFlow.storeActiveNomineeTask(activeNomineeTask, taskSpecificData));
}

export function* nomineeDashboardView({ logger }: TGlobalDependencies): Generator<any, any, any> {
  try {
    yield neuCall(nomineeViewDataWatcher);
  } catch (e) {
    logger.error(e);

    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(ENomineeRequestErrorNotifications.FETCH_NOMINEE_DATA_ERROR),
      ),
    );
    yield put(actions.nomineeFlow.storeError(ENomineeFlowError.FETCH_DATA_ERROR));
  }
}

export function* nomineeFlowLoadInvestmentAgreement(
  _: TGlobalDependencies,
  {
    payload: { etoId, previewCode },
  }: TActionFromCreator<typeof actions.nomineeFlow.nomineeLoadSignedInvestmentAgreement>,
): Generator<any, any, any> {
  const url = yield neuCall(loadInvestmentAgreement, etoId);
  yield put(actions.nomineeFlow.nomineeSetInvestmentAgreementHash(previewCode, url));
}

export function* nomineeFlowLoadAgreementsStatus(
  _: TGlobalDependencies,
  { payload }: TActionFromCreator<typeof actions.nomineeFlow.nomineeLoadEtoAgreementsStatus>,
): Generator<any, any, any> {
  const statuses: Dictionary<EEtoAgreementStatus, EAgreementType> = yield neuCall(
    loadAgreementsStatus,
    payload.eto,
  );

  yield put(actions.nomineeFlow.nomineeSetAgreementsStatus(payload.eto.previewCode, statuses));
}

export function* nomineeViewDataWatcher({ logger }: TGlobalDependencies): Generator<any, any, any> {
  while (true) {
    logger.info("Getting nominee data and tasks");
    yield neuCall(initNomineeDashboardView);
    yield take(actions.web3.newBlockArrived.getType());
  }
}

export type TGetRedeemShareCapitalTaskStateParams = {
  capitalIncrease: string;
  walletBalance: string;
};

export function* getRedeemShareCapitalTaskState(
  _: TGlobalDependencies,
  { capitalIncrease, walletBalance }: TGetRedeemShareCapitalTaskStateParams,
): Generator<any, any, any> {
  // capital increase is transferred to Nominee's wallet automatically when eto enters signing state.
  // if wallet balance is less than capital increase, we ASSUME here that capital increase already
  // has been transferred to the issuer's bank account and nominee now has to wait until issuer signs the ISHA.
  // this won't work with multiple nominee etos but ok for now.
  // When issuer signs the isha, nominee flow will go to the next stage - ACCEPT_ISHA
  // @see https://github.com/Neufund/platform-frontend/issues/3320, technical notes
  if (new BigNumber(walletBalance).lessThan(capitalIncrease)) {
    return ERedeemShareCapitalTaskSubstate.WAITING_FOR_ISSUER_TO_SIGN_ISHA;
  } else {
    return ERedeemShareCapitalTaskSubstate.REDEEM_CAPITAL_INCREASE;
  }
}

export function* getTaskSpecificData(
  _: TGlobalDependencies,
  activeNomineeTask: ENomineeTask | ENomineeEtoSpecificTask,
): Generator<any, any, any> {
  const taskSpecificData = cloneDeep(yield select(selectNomineeTasksData));

  if (activeNomineeTask === ENomineeTask.LINK_TO_ISSUER) {
    taskSpecificData[ENomineeTask.LINK_TO_ISSUER] = yield neuCall(getNomineeTaskLinkToIssuerData);
  }

  if (activeNomineeTask === ENomineeEtoSpecificTask.REDEEM_SHARE_CAPITAL) {
    const { previewCode, etoId }: TEtoWithCompanyAndContract = yield select(selectActiveNomineeEto);

    taskSpecificData.byPreviewCode[previewCode] = yield neuCall(
      getNomineeTaskRedeemShareCapitalData,
      etoId,
      previewCode,
    );
  }

  return taskSpecificData;
}

export function* getNomineeTaskRedeemShareCapitalData(
  _: TGlobalDependencies,
  etoId: string,
  previewCode: string,
): Generator<any, any, any> {
  const capitalIncrease: string = yield neuCall(
    loadCapitalIncrease,
    actions.eto.loadCapitalIncrease(etoId, previewCode),
  );
  const walletBalance: string = yield select(walletApi.selectors.selectLiquidEuroTokenBalance);
  const taskSubstate: ERedeemShareCapitalTaskSubstate = yield neuCall(
    getRedeemShareCapitalTaskState,
    { capitalIncrease, walletBalance },
  );

  return {
    [ENomineeEtoSpecificTask.REDEEM_SHARE_CAPITAL]: {
      capitalIncrease,
      walletBalance,
      taskSubstate,
    },
  };
}

export function* getNomineeTaskLinkToIssuerData(_: TGlobalDependencies): Generator<any, any, any> {
  yield neuCall(loadNomineeRequests); //nomineeRequestsWatcher fires every 10 seconds but we need this data right now

  const data = yield all({
    nomineeEto: select(selectActiveNomineeEto),
    nomineeRequest: select(selectNomineeRequests),
    nomineeRequestError: select(selectNomineeRequestError),
  });
  const dataConverted = {
    ...data,
    nomineeRequest: takeLatestNomineeRequest(data.nomineeRequest),
  };

  return {
    nextState: yield getNomineeRequestComponentState(dataConverted),
    error: data.nomineeRequstError,
  };
}

export function* nomineeDocumentsView({ logger }: TGlobalDependencies): Generator<any, any, any> {
  try {
    const verificationIsComplete = yield select(selectIsUserFullyVerified);
    if (verificationIsComplete) {
      yield neuCall(loadActiveNomineeEto);
    }
  } catch (e) {
    logger.error(e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(ENomineeRequestErrorNotifications.FETCH_NOMINEE_DATA_ERROR),
      ),
    );
    yield put(actions.nomineeFlow.storeError(ENomineeFlowError.FETCH_DATA_ERROR));
  }
}

export function* loadActiveNomineeEto(): Generator<any, any, any> {
  yield neuCall(loadNomineeEtos);
  yield neuCall(setActiveNomineeEto);
}

export function* nomineeRequestsWatcher({ logger }: TGlobalDependencies): Generator<any, any, any> {
  while (true) {
    logger.info("Getting nominee requests");
    yield put(actions.nomineeFlow.loadNomineeRequests());
    yield take(actions.web3.newBlockArrived.getType());
  }
}

export function* loadNomineeRequests({
  apiEtoNomineeService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    const nomineeRequests = yield apiEtoNomineeService.getNomineeRequests();
    const nomineeRequestsConverted: TNomineeRequestStorage = yield nomineeApiDataToNomineeRequests(
      nomineeRequests,
    );
    yield put(actions.nomineeFlow.setNomineeRequests(nomineeRequestsConverted));
  } catch (e) {
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(ENomineeRequestErrorNotifications.FETCH_NOMINEE_DATA_ERROR),
      ),
    );

    logger.error("Error while loading nominee requests", e);
  }
}

export function* createNomineeRequest(
  { apiEtoNomineeService, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.nomineeFlow.createNomineeRequest>,
): Generator<any, any, any> {
  try {
    const nomineeRequest: TNomineeRequestResponse = yield apiEtoNomineeService.createNomineeRequest(
      action.payload.issuerId,
    );
    const nomineeRequestConverted: INomineeRequest = nomineeRequestResponseToRequestStatus(
      nomineeRequest,
    );

    yield put(
      actions.nomineeFlow.storeNomineeRequest(action.payload.issuerId, nomineeRequestConverted),
    );
  } catch (e) {
    if (e instanceof IssuerIdInvalid) {
      logger.error("Failed to create nominee request, issuer id is invalid", e);
      yield put(
        actions.nomineeFlow.storeNomineeRequestError(
          action.payload.issuerId,
          ENomineeRequestError.ISSUER_ID_ERROR,
        ),
      );
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(ENomineeRequestErrorNotifications.ISSUER_ID_ERROR),
        ),
      );
    } else if (e instanceof NomineeRequestExists) {
      logger.error(`Nominee request to issuerId ${action.payload.issuerId} already exists`, e);
      yield put(
        actions.nomineeFlow.storeNomineeRequestError(
          action.payload.issuerId,
          ENomineeRequestError.REQUEST_EXISTS,
        ),
      );
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(ENomineeRequestErrorNotifications.REQUEST_EXISTS),
        ),
      );
    } else {
      logger.error("Failed to create nominee request", e);
      yield put(
        actions.nomineeFlow.storeNomineeRequestError(
          action.payload.issuerId,
          ENomineeRequestError.GENERIC_ERROR,
        ),
      );
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(ENomineeRequestErrorNotifications.SUBMITTING_ERROR),
        ),
      );
    }
  } finally {
    yield put(actions.routing.goToDashboard());
    yield put(actions.nomineeFlow.loadingDone());
  }
}

export function* loadNomineeAgreements(): Generator<any, any, any> {
  const nomineeEto: ReturnType<typeof selectActiveNomineeEto> = yield select(
    selectActiveNomineeEto,
  );

  if (nomineeEto) {
    yield put(actions.nomineeFlow.nomineeLoadEtoAgreementsStatus(nomineeEto));
  }
}

export function* loadNomineeEto(
  _: TGlobalDependencies,
  eto: TEtoWithCompanyAndContract,
): Generator<any, any, any> {
  if (eto.state === EEtoState.ON_CHAIN) {
    eto.contract = yield neuCall(getEtoContract, eto.etoId, eto.state);
  }
  eto.subState = yield select(selectEtoSubStateEtoEtoWithContract, eto);
  return eto;
}

export function* loadNomineeEtos({
  apiEtoService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    const etos: TEtoWithCompanyAndContract[] = yield apiEtoService.loadNomineeEtos();

    yield put(actions.bookBuilding.loadBookBuildingListStats(etos.map(eto => eto.etoId)));

    let getEtoDataEffects: Dictionary<Generator<any, any, any>, string> = {};
    let getEtoSpecificTaskStatusEffects: Dictionary<Generator<any, any, any>, string> = {};
    let getEtoSpecificTaskDataEffects: Dictionary<Generator<any, any, any>, string> = {};

    etos.forEach((eto: TEtoWithCompanyAndContract) => {
      getEtoDataEffects[eto.previewCode] = neuCall(loadNomineeEto, eto);
      getEtoSpecificTaskStatusEffects[eto.previewCode] = neuCall(
        initEtoSpecificTaskStatus,
        eto.previewCode,
      );
      getEtoSpecificTaskDataEffects[eto.previewCode] = neuCall(
        initEtoSpecificTaskData,
        eto.previewCode,
      );
    });

    const result = yield all({
      etoData: all(getEtoDataEffects),
      etoSpecificTaskStatus: all(getEtoSpecificTaskStatusEffects),
      etoSpecificTaskData: all(getEtoSpecificTaskDataEffects),
    });

    yield all([
      put(actions.nomineeFlow.setNomineeEtos({ etos: result.etoData })),
      put(actions.nomineeFlow.setNomineeEtoSpecificTasksData(result.etoSpecificTaskData)),
      put(actions.nomineeFlow.setNomineeEtoSpecificTasksStatus(result.etoSpecificTaskStatus)),
    ]);
  } catch (e) {
    logger.error("Nominee ETOs could not be loaded", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(EtoMessage.COULD_NOT_LOAD_ETOS),
      ),
    );
    yield put(actions.nomineeFlow.storeError(ENomineeFlowError.LOAD_ETOS_ERROR));
  }
}

export function* initEtoSpecificTaskStatus(
  _: TGlobalDependencies,
  previewCode: string,
): Generator<any, any, any> {
  const taskStatus: TNomineeEtoSpecificTasksStatus = yield select(
    selectEtoSpecificTasksStatus,
    previewCode,
  );
  return taskStatus === undefined ? cloneDeep(initialNomineeEtoSpecificTaskStatus) : taskStatus;
}

export function* initEtoSpecificTaskData(
  _: TGlobalDependencies,
  preivewCode: string,
): Generator<any, any, any> {
  const taskData = yield select(selectEtoSpecificTaskData, preivewCode);
  return taskData === undefined ? cloneDeep(initialEtoSpecificTaskData) : taskData;
}

export function* setActiveNomineeEto({ logger }: TGlobalDependencies): Generator<any, any, any> {
  try {
    const etos: ReturnType<typeof selectNomineeEtos> = yield select(selectNomineeEtos);

    if (etos === undefined || isEmpty(etos)) {
      yield put(actions.nomineeFlow.setActiveNomineeEtoPreviewCode(undefined));
    } else {
      const forcedActiveEtoPreviewCode: ReturnType<typeof selectActiveEtoPreviewCodeFromQueryString> = yield select(
        selectActiveEtoPreviewCodeFromQueryString,
      );

      // For testing purpose we can force another ETO to be active (by default it's the first one)
      const shouldForceSpecificEtoToBeActive =
        forcedActiveEtoPreviewCode !== undefined && etos[forcedActiveEtoPreviewCode] !== undefined;

      if (shouldForceSpecificEtoToBeActive) {
        yield put(actions.nomineeFlow.setActiveNomineeEtoPreviewCode(forcedActiveEtoPreviewCode));

        yield put(
          webNotificationUIModuleApi.actions.showInfo(
            createNotificationMessage(EEtoNomineeActiveEtoNotifications.ACTIVE_ETO_SET_SUCCESS),
          ),
        );
      } else {
        const firstEto = nonNullable(Object.values(etos)[0]);

        yield put(actions.nomineeFlow.setActiveNomineeEtoPreviewCode(firstEto.previewCode));
      }
    }
  } catch (e) {
    logger.fatal("Could not set active eto", e);

    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(EEtoNomineeActiveEtoNotifications.ACTIVE_ETO_SET_ERROR),
      ),
    );
    yield put(actions.nomineeFlow.storeError(ENomineeFlowError.ACTIVE_ETO_SET_ERROR));
  }
}

export function* uploadAndCheckIsha(
  _: TGlobalDependencies,
  { payload: { file } }: TActionFromCreator<typeof actions.nomineeFlow.nomineeUploadIsha>,
): Generator<any, any, any> {
  const nomineeEto = yield select(selectActiveNomineeEto);
  yield put(actions.nomineeFlow.nomineeIshaUploadInProgress(nomineeEto.etoId));

  const hashes = yield all({
    issuerIshaHash: neuCall(loadIshaHash, nomineeEto.etoId),
    nomineeIshaHash: generateIpfsHash(file),
  });

  if (hashes.issuerIshaHash === hashes.nomineeIshaHash) {
    yield put(actions.nomineeFlow.nomineeIshaCheckSuccess(nomineeEto.previewCode, file.name));
  } else {
    yield put(actions.nomineeFlow.nomineeIshaCheckError(nomineeEto.previewCode, file.name));
  }
}

export function* loadIshaHash(
  { contractsService }: TGlobalDependencies,
  etoId: string,
): Generator<any, any, any> {
  const etoCommitmentContract: ETOCommitment = yield contractsService.getETOCommitmentContract(
    etoId,
  );
  const ishaUrl = yield etoCommitmentContract.signedInvestmentAgreementUrl;
  if (ishaUrl !== "") {
    return hashFromIpfsLink(ishaUrl);
  } else {
    throw new Error("isha hash is empty");
  }
}

export function* nomineeFlowSagas(): Generator<any, any, any> {
  yield fork(
    neuTakeLatestUntil,
    actions.nomineeFlow.nomineeDashboardView,
    "@@router/LOCATION_CHANGE",
    nomineeDashboardView,
  );
  yield fork(
    neuTakeLatestUntil,
    actions.nomineeFlow.nomineeDocumentsView,
    "@@router/LOCATION_CHANGE",
    nomineeDocumentsView,
  );
  yield fork(neuTakeLatest, actions.nomineeFlow.loadNomineeEtos, loadNomineeEtos);
  yield fork(neuTakeLatest, actions.nomineeFlow.loadNomineeRequests, loadNomineeRequests);
  yield fork(neuTakeLatest, actions.nomineeFlow.createNomineeRequest, createNomineeRequest);
  yield fork(
    neuTakeEvery,
    actions.nomineeFlow.nomineeLoadEtoAgreementsStatus,
    nomineeFlowLoadAgreementsStatus,
  );
  yield fork(
    neuTakeLatest,
    actions.nomineeFlow.startSetingActiveNomineeEtoPreviewCode,
    setActiveNomineeEto,
  );
  yield fork(
    neuTakeLatestUntil,
    actions.nomineeFlow.startNomineeRequestsWatcher,
    [actions.nomineeFlow.stopNomineeRequestsWatcher, "@@router/LOCATION_CHANGE"],
    nomineeRequestsWatcher,
  );
  yield fork(
    neuTakeLatestUntil,
    actions.nomineeFlow.startNomineeViewWatcher,
    [actions.nomineeFlow.stopNomineeTaskWatcher, "@@router/LOCATION_CHANGE"],
    nomineeViewDataWatcher,
  );
  yield fork(neuTakeLatest, actions.nomineeFlow.nomineeUploadIsha, uploadAndCheckIsha);
}
