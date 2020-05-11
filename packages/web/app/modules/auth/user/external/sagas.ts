import { call, put } from "@neufund/sagas";

import { TGlobalDependencies } from "../../../../di/setupBindings";
import { IUser, IUserInput } from "../../../../lib/api/users/interfaces";
import { actions } from "../../../actions";
import { stopServices } from "../../../init/sagas";
import { loadKycRequestData } from "../../../kyc/sagas";
import { neuCall } from "../../../sagasUtils";
import { loadPreviousWallet } from "../../../web3/sagas";

export function* loadUser({ apiUserService }: TGlobalDependencies): Generator<any, IUser, any> {
  const user: IUser = yield apiUserService.me();
  yield neuCall(loadPreviousWallet);
  yield put(actions.auth.setUser(user));
  yield neuCall(loadKycRequestData);
  return user;
}

export function* updateUser(
  { apiUserService }: TGlobalDependencies,
  updatedUser: IUserInput,
): Generator<any, any, any> {
  const user: IUser = yield apiUserService.updateUser(updatedUser);

  yield put(actions.auth.setUser(user));
}

export function* logoutUser({
  web3Manager,
  jwtStorage,
  logger,
  userStorage,
}: TGlobalDependencies): Generator<any, void, any> {
  yield neuCall(stopServices);
  yield* call(() => userStorage.clear());
  yield* call(() => jwtStorage.clear());
  const hasPluggedWallet = yield web3Manager.hasPluggedWallet();
  if (hasPluggedWallet) {
    yield web3Manager.unplugPersonalWallet();
  }
  yield put(actions.web3.personalWalletDisconnected());

  // reset app state and restart sagas here
  yield put(actions.auth.logoutDone());

  logger.info("user has been logged out");
  logger.setUser(null);
}
