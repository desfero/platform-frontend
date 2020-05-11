import { call, fork, put, select, take } from "@neufund/sagas";
import { invariant } from "@neufund/shared-utils";
import { includes } from "lodash";

import {
  BackupRecoveryMessage,
  GenericErrorMessage,
  GenericModalMessage,
  SignInUserErrorMessage,
} from "../../../components/translatedMessages/messages";
import { createMessage } from "../../../components/translatedMessages/utils";
import { USERS_WITH_ACCOUNT_SETUP } from "../../../config/constants";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { EUserType, IUser } from "../../../lib/api/users/interfaces";
import { EmailAlreadyExists } from "../../../lib/api/users/UsersApi";
import {
  LightError,
  LightWallet,
  LightWalletLocked,
} from "../../../lib/web3/light-wallet/LightWallet";
import { TAppGlobalState } from "../../../store";
import { connectLightWallet } from "../../access-wallet/sagas";
import { actions, TActionFromCreator } from "../../actions";
import { selectUserType } from "../../auth/selectors";
import { loadUser, updateUser } from "../../auth/user/external/sagas";
import { signInUser } from "../../auth/user/sagas";
import { userHasKycAndEmailVerified } from "../../eto-flow/selectors";
import { displayInfoModalSaga } from "../../generic-modal/sagas";
import { neuCall, neuTakeEvery, neuTakeLatestUntil } from "../../sagasUtils";
import { selectIsUnlocked } from "../../web3/selectors";
import { EWalletType, ILightWalletMetadata } from "../../web3/types";
import { registerForm } from "../forms/sagas";
import { resetWalletSelectorState, walletSelectorConnect } from "../sagas";
import { selectRegisterWalletDefaultFormValues } from "../selectors";
import { EFlowType, TLightWalletFormValues } from "../types";
import { mapLightWalletErrorToErrorMessage } from "./errors";
import { getWalletMetadataByURL } from "./metadata/sagas";
import { ERecoveryPhase } from "./reducer";
import { lightWalletRegister } from "./register/sagas";
import { getUserMeWithSeedOnly, setupLightWallet } from "./signing/sagas";
import { getVaultKey } from "./utils";

export const DEFAULT_HD_PATH = "m/44'/60'/0'";

export function* lightWalletBackupWatch({ logger }: TGlobalDependencies): Generator<any, any, any> {
  try {
    const user: IUser = yield select((state: TAppGlobalState) => state.auth.user);
    yield neuCall(updateUser, { ...user, backupCodesVerified: true });
    yield call(
      displayInfoModalSaga,
      createMessage(BackupRecoveryMessage.BACKUP_SUCCESS_TITLE),
      createMessage(BackupRecoveryMessage.BACKUP_SUCCESS_DESCRIPTION),
    );
    yield neuCall(loadUser);

    const userType = yield select(selectUserType);
    const kycAndEmailVerified = yield select(userHasKycAndEmailVerified);

    if (!kycAndEmailVerified && includes(USERS_WITH_ACCOUNT_SETUP, userType)) {
      yield put(actions.routing.goToDashboard());
    } else {
      yield put(actions.routing.goToProfile());
    }
  } catch (e) {
    logger.error("Light Wallet Backup Error", e);
    yield put(
      actions.walletSelector.lightWalletConnectionError(mapLightWalletErrorToErrorMessage(e)),
    );
  }
}

export function* loadSeedFromWalletWatch({
  logger,
  web3Manager,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    const isUnlocked = yield* select((s: TAppGlobalState) => selectIsUnlocked(s.web3));

    if (!isUnlocked) {
      yield put(
        actions.walletSelector.lightWalletConnectionError(
          mapLightWalletErrorToErrorMessage(new LightWalletLocked()),
        ),
      );
      return;
    }
    const lightWallet = web3Manager.personalWallet as LightWallet;
    const { seed, privateKey } = yield* call(lightWallet.getWalletPrivateData);
    yield put(actions.web3.loadWalletPrivateDataToState(seed, privateKey));
  } catch (e) {
    logger.error("Load seed from wallet failed", e);
    yield put(
      actions.walletSelector.lightWalletConnectionError(mapLightWalletErrorToErrorMessage(e)),
    );
  }
}

export function* handleLightWalletError({ logger }: TGlobalDependencies, e: Error): any {
  let error;

  if (e instanceof EmailAlreadyExists) {
    error = createMessage(GenericErrorMessage.USER_ALREADY_EXISTS);
  } else if (e instanceof LightError) {
    logger.error("Light wallet recovery/register error", e);
    error = mapLightWalletErrorToErrorMessage(e);
  } else {
    error = createMessage(SignInUserErrorMessage.MESSAGE_SIGNING_SERVER_CONNECTION_FAILURE);
  }

  yield put(
    actions.genericModal.showErrorModal(createMessage(GenericModalMessage.ERROR_TITLE), error),
  );
}

export function* lightWalletLoginWatch(
  { web3Manager, lightWalletConnector, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.walletSelector.lightWalletLogin>,
): Generator<any, void, any> {
  const { password } = action.payload;

  try {
    const walletMetadata = yield* getWalletMetadataByURL(password);

    if (!walletMetadata) {
      yield invariant(walletMetadata, "Missing metadata");
      return;
    }

    const wallet = yield* connectLightWallet(
      lightWalletConnector,
      walletMetadata as ILightWalletMetadata,
      password,
    );

    yield web3Manager.plugPersonalWallet(wallet);
    yield walletSelectorConnect();
  } catch (e) {
    logger.error("Light Wallet login error", e);
    yield put(actions.walletSelector.reset());
    yield put(
      actions.walletSelector.lightWalletConnectionError(mapLightWalletErrorToErrorMessage(e)),
    );
  }
}

export function* connectAndRestoreLightWallet(
  { vaultApi }: TGlobalDependencies,
  userType: EUserType,
  seed: string,
): any {
  const registerFormDefaultValues: TLightWalletFormValues = yield select(
    selectRegisterWalletDefaultFormValues,
  );

  if (!registerFormDefaultValues) {
    throw new Error("registerFormDefaultValues should be defined at this stage");
  }
  const walletMetadata = yield* neuCall(
    setupLightWallet,
    registerFormDefaultValues.email,
    registerFormDefaultValues.password,
    seed,
  );
  yield neuCall(signInUser, {
    cleanupGenerator: function*(): Generator<any, void, any> {
      const vaultKey = yield* call(
        getVaultKey,
        walletMetadata.salt,
        registerFormDefaultValues.password,
      );

      yield vaultApi.confirm(vaultKey);
    },
    userType,
    email: registerFormDefaultValues.email,
    salt: walletMetadata.salt,
    tos: registerFormDefaultValues.tos,
    backupCodesVerified: true,
  });
}
export function* lightWalletRestore(_: TGlobalDependencies): Generator<any, void, any> {
  yield neuCall(resetWalletSelectorState);
  const baseUiData = {
    walletType: EWalletType.LIGHT,
    flowType: EFlowType.RESTORE_WALLET,
    showWalletSelector: false,
    rootPath: "/restore",
  };

  const {
    payload: { seed },
  } = yield take(actions.walletSelector.submitSeed);
  yield put(actions.walletSelector.setRecoveryPhase(ERecoveryPhase.FORM_ENTRY_COMPONENT));

  try {
    const user = yield* neuCall(getUserMeWithSeedOnly, seed);

    const userEmail = user?.verifiedEmail || user?.unverifiedEmail || "";
    const userType = user?.type || EUserType.INVESTOR;
    const flowType = user ? EFlowType.RESTORE_WALLET : EFlowType.IMPORT_WALLET;

    const initialFormValues = {
      email: userEmail,
      password: "",
      repeatPassword: "",
      tos: false,
    };

    yield neuCall(registerForm, {
      afterRegistrationGenerator: () => neuCall(connectAndRestoreLightWallet, userType, seed),
      expectedAction: actions.walletSelector.lightWalletRegisterFormData,
      initialFormValues,
      baseUiData: {
        ...baseUiData,
        flowType,
      },
      userEmail,
    });
  } catch (e) {
    yield neuCall(resetWalletSelectorState);
    yield neuCall(handleLightWalletError, e);
    yield put(actions.walletSelector.setRecoveryPhase(ERecoveryPhase.SEED_ENTRY_COMPONENT));
  }
}

export function* lightWalletSagas(): Generator<any, any, any> {
  yield fork(neuTakeEvery, actions.walletSelector.lightWalletLogin, lightWalletLoginWatch);
  yield fork(neuTakeEvery, actions.walletSelector.lightWalletBackedUp, lightWalletBackupWatch);
  yield fork(neuTakeEvery, "WEB3_FETCH_SEED", loadSeedFromWalletWatch);
  yield fork(
    neuTakeLatestUntil,
    actions.walletSelector.restoreLightWallet,
    "@@router/LOCATION_CHANGE",
    lightWalletRestore,
  );
  yield fork(
    neuTakeLatestUntil,
    actions.walletSelector.registerWithLightWallet,
    "@@router/LOCATION_CHANGE",
    lightWalletRegister,
  );
}
