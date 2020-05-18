import { channel, fork, put, race, take } from "@neufund/sagas";
import { authModuleAPI } from "@neufund/shared-modules";
import { assertNever } from "@neufund/shared-utils";

import { TGlobalDependencies } from "../../../di/setupBindings";
import { EUserActivityMessage } from "../../../lib/dependencies/broadcast-channel/types";
import { STORAGE_JWT_KEY } from "../../../lib/persistence/JwtObjectStorage";
import { USER_JWT_KEY as USER_KEY } from "../../../lib/persistence/UserStorage";
import { STORAGE_WALLET_CONNECT_KEY } from "../../../lib/persistence/WalletConnectStorage";
import { STORAGE_WALLET_METADATA_KEY } from "../../../lib/persistence/WalletStorage";
import { actions } from "../../actions";
import { EInitType } from "../../init/reducer";
import { neuCall, neuTakeUntil } from "../../sagasUtils";
import { ELogoutReason, EUserAuthType } from "../types";

/**
 * Multi browser logout/login feature
 */
const redirectChannel = channel<{ type: EUserAuthType }>();

/**
 * Saga that starts an Event Channel Emitter that listens to storage
 * events from the browser
 */
export function* startRedirectChannel({
  userActivityChannel,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  userActivityChannel.addEventListener("message", ({ status }) => {
    switch (status) {
      case EUserActivityMessage.USER_ACTIVE:
        redirectChannel.put({
          type: EUserAuthType.REFRESH,
        });
        break;
      default:
        logger.error(assertNever(status, "Unknown User Activity Posted Message"));
        break;
    }
  });
  window.addEventListener("storage", (evt: StorageEvent) => {
    if (evt.key === STORAGE_JWT_KEY && evt.oldValue && !evt.newValue) {
      redirectChannel.put({
        type: EUserAuthType.LOGOUT,
      });
    }
    if (evt.key === STORAGE_WALLET_METADATA_KEY && evt.oldValue && !evt.newValue) {
      redirectChannel.put({
        type: EUserAuthType.LOGOUT,
      });
    }
    if (evt.key === STORAGE_WALLET_CONNECT_KEY && evt.oldValue && !evt.newValue) {
      redirectChannel.put({
        type: EUserAuthType.LOGOUT,
      });
    }
    if (evt.key === USER_KEY && !evt.oldValue && evt.newValue) {
      redirectChannel.put({
        type: EUserAuthType.LOGIN,
      });
    }
  });
}

/**
 * Saga that watches events coming from redirectChannel and
 * dispatches login/logout actions
 */
export function* watchRedirectChannel(): Generator<any, any, any> {
  yield neuCall(startRedirectChannel);
  while (true) {
    const userAction = yield take(redirectChannel);
    switch (userAction.type) {
      case EUserAuthType.LOGOUT:
        yield put(actions.auth.logout());
        break;
      case EUserAuthType.LOGIN:
        yield put(actions.init.start(EInitType.APP_INIT));
        break;
      case EUserAuthType.REFRESH:
        yield put(actions.auth.refreshTimer());
        break;
    }
  }
}

/**
 * Saga that watches for timeout events and logs out the
 * user when a timeout actions is dispatched */
export function* watchTimeoutActions(): Generator<any, any, any> {
  yield race({
    userTimeout: take(actions.auth.userActivityTimeout),
    jwtTimeout: take(actions.auth.jwtTimeout),
  });
  yield put(actions.auth.logout({ logoutType: ELogoutReason.SESSION_TIMEOUT }));
}

export function* authWatcherSagas(): Generator<any, any, any> {
  yield fork(watchRedirectChannel);
  yield neuTakeUntil(
    authModuleAPI.actions.setUser,
    actions.auth.stopTimeoutWatcher,
    watchTimeoutActions,
  );
}
