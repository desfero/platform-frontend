import { all, delay, fork, neuTakeOnly, put, race, select } from "@neufund/sagas";
import { Dictionary } from "@neufund/shared-utils";
import { LOCATION_CHANGE } from "connected-react-router";
import { map } from "lodash/fp";

import { TGlobalDependencies } from "../../../di/setupBindings";
import { EEtoState, TEtoSpecsData } from "../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { TAppGlobalState } from "../../../store";
import { actions, TActionFromCreator } from "../../actions";
import { neuCall, neuFork, neuTakeEveryUntil } from "../../sagasUtils";
import { etoInProgressPollingDelay, etoNormalPollingDelay } from "../constants";
import { selectInvestorEtoWithCompanyAndContract } from "../selectors";
import { EETOStateOnChain, TEtoWithCompanyAndContractReadonly } from "../types";
import { getEtoNextStateStartDate } from "../utils";

const etoNextStateCount: Dictionary<number | undefined> = {};
interface IStrategies {
  [key: string]: number;
}

export function* calculateNextStateDelay(
  { logger }: TGlobalDependencies,
  eto: TEtoWithCompanyAndContractReadonly,
): Generator<any, number | undefined, void> {
  const nextStartDate: Date | undefined = getEtoNextStateStartDate(eto);
  if (nextStartDate) {
    const timeToNextState = nextStartDate.getTime() - Date.now();
    if (timeToNextState > 0) {
      etoNextStateCount[eto.previewCode] = undefined;
      // add small delay to start date to avoid fetching eto in same state
      return timeToNextState + 2000;
    }

    // if timeToNextState is negative then user and ethereum clock are not in sync
    // in that case poll eto 1 minute with intervals of 2seconds and then 4 minutes more with 5 seconds interval
    // if after that state time is still negative log warning message
    const nextStateWatchCount = etoNextStateCount[eto.previewCode];
    if (nextStateWatchCount === undefined) {
      etoNextStateCount[eto.previewCode] = 1;
      return 2000;
    }

    if (nextStateWatchCount < 30) {
      etoNextStateCount[eto.previewCode] = nextStateWatchCount + 1;
      return 2000;
    }

    if (nextStateWatchCount >= 30 && nextStateWatchCount < 78) {
      etoNextStateCount[eto.previewCode] = nextStateWatchCount + 1;
      return 5000;
    }

    logger.warn(
      "ETO next state polling failed.",
      new Error("User and ethereum clocks are not in sync"),
      { etoPreviewCode: eto.previewCode },
    );
  }

  return undefined;
}

export function* getEtoRefreshStrategies(
  _: TGlobalDependencies,
  eto: TEtoWithCompanyAndContractReadonly,
): Generator<any, IStrategies, any> {
  const strategies: IStrategies = {
    default: etoNormalPollingDelay,
  };
  if (eto.state === EEtoState.ON_CHAIN) {
    if ([EETOStateOnChain.Whitelist, EETOStateOnChain.Public].includes(eto.contract!.timedState)) {
      strategies.inProgress = etoInProgressPollingDelay;
    }

    const nextStateDelay = yield* neuCall(calculateNextStateDelay, eto);
    // Do not schedule update if it's later than normal polling
    // otherwise it's possible to overflow max timeout limit
    // see https://stackoverflow.com/questions/3468607/why-does-settimeout-break-for-large-millisecond-delay-values
    if (nextStateDelay && nextStateDelay < etoNormalPollingDelay) {
      strategies.nextState = nextStateDelay;
    }
  }

  return strategies;
}

/**
 * just wraps strategies with delay
 */
export const raceStrategies = (strategies: IStrategies) => {
  const modifiedStrategies: { [key: string]: ReturnType<typeof delay> } = {};
  return Object.keys(strategies).reduce((acc, key) => {
    acc[key] = delay(strategies[key]);
    return acc;
  }, modifiedStrategies);
};

export function* etoDelay(_: TGlobalDependencies, previewCode: string): Generator<any, void, any> {
  const eto: TEtoWithCompanyAndContractReadonly = yield select((state: TAppGlobalState) =>
    selectInvestorEtoWithCompanyAndContract(state, previewCode),
  );

  const strategies = yield* neuCall(getEtoRefreshStrategies, eto);
  yield race(raceStrategies(strategies));
  yield put(actions.eto.loadEtoPreview(eto.previewCode));
}

export function* watchSetEtoAction(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.eto.setEto> | { payload: { eto: TEtoSpecsData } },
): Generator<any, void, void> {
  const previewCode = action.payload.eto.previewCode;

  yield race({
    wait: neuFork(etoDelay, previewCode),
    cancel: neuTakeOnly(actions.eto.setEto, { eto: { previewCode } }),
  });
}

function* setupWatchSetEtoAction(
  _: TGlobalDependencies,
  eto: TEtoSpecsData,
): Generator<any, void, void> {
  yield neuFork(watchSetEtoAction, { payload: { eto } });
}

export function* watchEtosSetActionSaga(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.eto.setEtos>,
): Generator<any, void, void> {
  yield fork(neuTakeEveryUntil, actions.eto.setEto, LOCATION_CHANGE, watchSetEtoAction);
  yield all(map(eto => neuFork(setupWatchSetEtoAction, eto), action.payload.etos));
}
