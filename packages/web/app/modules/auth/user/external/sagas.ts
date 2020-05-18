import { call, put, SagaGenerator } from "@neufund/sagas";
import { authModuleAPI, IUserInput } from "@neufund/shared-modules";

import { TGlobalDependencies } from "../../../../di/setupBindings";
import { actions } from "../../../actions";
import { stopServices } from "../../../init/sagas";
import { loadKycRequestData } from "../../../kyc/sagas";
import { neuCall } from "../../../sagasUtils";
import { loadPreviousWallet } from "../../../web3/sagas";

export function* updateUser(_: TGlobalDependencies, updatedUser: IUserInput): SagaGenerator<void> {
  yield* call(authModuleAPI.sagas.updateUser, updatedUser);
}

export function* loadUser(): SagaGenerator<void> {
  yield* neuCall(loadPreviousWallet);

  yield* call(authModuleAPI.sagas.loadUser);

  yield* neuCall(loadKycRequestData);
}

export function* logoutUser({
  web3Manager,
  logger,
  userStorage,
}: TGlobalDependencies): Generator<any, void, any> {
  yield neuCall(stopServices);

  yield* call(() => userStorage.clear());
  const hasPluggedWallet = yield web3Manager.hasPluggedWallet();
  if (hasPluggedWallet) {
    yield web3Manager.unplugPersonalWallet();
  }
  yield put(actions.web3.personalWalletDisconnected());

  // reset app state and restart sagas here
  yield put(authModuleAPI.actions.reset());
  yield put(actions.auth.logoutDone());

  logger.info("user has been logged out");
}
