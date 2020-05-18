import { Effect, fork, put, select } from "@neufund/sagas";
import { EUserType } from "@neufund/shared-modules";
import { LocationChangeAction, RouterState } from "connected-react-router";
import { match } from "react-router";

import { TGlobalDependencies } from "../../di/setupBindings";
import { actions, TActionFromCreator } from "../actions";
import { selectIsAuthorized, selectUserType } from "../auth/selectors";
import { waitForAppInit } from "../init/sagas";
import { neuCall, neuTakeEvery } from "../sagasUtils";
import { routes } from "./routes";

type TRouteActions = {
  // "undefined" is for backwards compatibility,
  // see comments in the ./routeDefinitions.ts
  notAuth: undefined | Effect;
  investor: undefined | Effect;
  issuer: undefined | Effect;
  nominee: undefined | Effect;
};

export const GREYP_PREVIEW_CODE = "e2b6949e-951d-4e99-ac11-534fdad86a80";

function* openInNewWindowSaga(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.routing.openInNewWindow>,
): Generator<any, any, any> {
  const { path } = action.payload;

  //Open the popup and set the opener and referrer policy instruction
  const newWindow = window.open(path, "_blank", "noopener,noreferrer");

  //Reset the opener link
  if (newWindow) {
    newWindow.opener = null;
  }
}

export function* startRouteBasedSagas(
  { logger }: TGlobalDependencies,
  action: LocationChangeAction,
): Generator<any, any, any> {
  const appIsReady = yield waitForAppInit();
  const userIsAuthorized = yield* select(selectIsAuthorized);
  const userType = yield* select(selectUserType);

  logger.info(
    `userIsAuthorized: ${userIsAuthorized.toString()}, userType: ${userType}, route: ${
      action.payload.location.pathname
    }`,
  );

  if (appIsReady) {
    yield neuCall(router, action.payload);
  }
}

export function* router(
  { logger }: TGlobalDependencies,
  payload: RouterState,
): Generator<any, any, any> {
  try {
    for (const route of routes) {
      const routeMatch = yield route(payload);
      if (routeMatch) {
        return;
      }
    }
    return;
  } catch (e) {
    logger.error("error in routing saga", e);
    yield put(actions.routing.goHome());
  }
}

export function* routeInternal(routeActions: TRouteActions): Generator<any, any, any> {
  // if routeAction is defined, execute it and return true to stop iterating over routes.
  // If action is undefined, simply return true, this is for backwards
  // compatibility with our legacy routing
  const userIsAuthorized = yield select(selectIsAuthorized);
  const userType = yield select(selectUserType);

  if (!userIsAuthorized) {
    yield routeActions.notAuth !== undefined ? routeActions.notAuth : undefined;
    return true;
  }

  if (userIsAuthorized && userType === EUserType.INVESTOR) {
    yield routeActions.investor !== undefined ? routeActions.investor : undefined;
    return true;
  }

  if (userIsAuthorized && userType === EUserType.ISSUER) {
    yield routeActions.issuer !== undefined ? routeActions.issuer : undefined;
    return true;
  }

  if (userIsAuthorized && userType === EUserType.NOMINEE) {
    yield routeActions.nominee !== undefined ? routeActions.nominee : undefined;
    return true;
  }
}

export function* routeAction<P>(
  routeMatch: match<P> | null,
  routeActions: TRouteActions,
): Generator<any, any, any> {
  if (routeMatch !== null) {
    return yield routeInternal(routeActions);
  }
}

export function* routingSagas(): Generator<unknown, void> {
  yield fork(neuTakeEvery, actions.routing.openInNewWindow, openInNewWindowSaga);
  yield fork(neuTakeEvery, "@@router/LOCATION_CHANGE", startRouteBasedSagas);
}
