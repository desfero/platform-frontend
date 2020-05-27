import { takeLeading, put, call, neuCall, SagaGenerator, TActionFromCreator } from "@neufund/sagas";
import { coreModuleApi, neuGetBindings, authModuleAPI } from "@neufund/shared-modules";
import {
  isJwtExpiringLateEnough,
  toEthereumPrivateKey,
  toEthereumHDMnemonic,
  invariant,
} from "@neufund/shared-utils";
import Config from "react-native-config";

import { walletEthModuleApi } from "modules/eth/module";
import { notificationUIModuleApi } from "modules/notification-ui/module";

import { authActions } from "./actions";
import { InvalidImportPhraseError } from "./errors";
import { loadOrCreateUser } from "./sagasInternal";
import { EImportPhrase } from "./types";
import { parseImportPhrase } from "./utils";

export function* trySignInExistingAccount(): SagaGenerator<void> {
  const { ethManager, logger } = yield* neuGetBindings({
    ethManager: walletEthModuleApi.symbols.ethManager,
    logger: coreModuleApi.symbols.logger,
  });

  const hasExistingWallet = yield* call(() => ethManager.hasExistingWallet());

  if (!hasExistingWallet) {
    logger.info("No existing wallet to sign in");

    yield put(authActions.canCreateAccount());

    return;
  }

  const unlockFlow = Config.NF_ACCOUNT_UNLOCK_FLOW ?? "auto";

  logger.info(`Unlock flow set to ${unlockFlow}`);

  switch (Config.NF_ACCOUNT_UNLOCK_FLOW) {
    case "user_requested":
      yield* call(allowToUnlockExistingAccount);
      break;

    case "auto":
    default:
      yield* call(signInExistingAccount);
      break;
  }
}

function* allowToUnlockExistingAccount(): SagaGenerator<void> {
  const { ethManager } = yield* neuGetBindings({
    ethManager: walletEthModuleApi.symbols.ethManager,
  });

  const walletMetadata = yield* call(() => ethManager.getExistingWalletMetadata());

  // do not allow to unlock existing account without having existing wallet
  invariant(walletMetadata, "No existing wallet to sign in");

  yield put(authActions.canUnlockAccount(walletMetadata));
}

function* signInExistingAccount(): SagaGenerator<void> {
  const { ethManager } = yield* neuGetBindings({
    ethManager: walletEthModuleApi.symbols.ethManager,
  });

  const walletMetadata = yield* call(() => ethManager.getExistingWalletMetadata());

  // do not allow to start sign in without having existing wallet
  invariant(walletMetadata, "No existing wallet to sign in");

  yield put(authActions.signIn());

  yield* call(() => ethManager.plugExistingWallet());

  const jwt = yield* neuCall(authModuleAPI.sagas.loadJwt);
  // if JWT is already in the store and it's won't expire soon
  // then just feed state with the current jwt
  if (jwt && isJwtExpiringLateEnough(jwt)) {
    yield* neuCall(authModuleAPI.sagas.setJwt, jwt);
  } else {
    yield* call(authModuleAPI.sagas.createJwt, []);
  }

  // given that user may already exist just load the user from database
  yield* call(loadOrCreateUser);

  yield put(authActions.signed(walletMetadata));
}

function* createNewAccount(): SagaGenerator<void> {
  const { ethManager, logger } = yield* neuGetBindings({
    ethManager: walletEthModuleApi.symbols.ethManager,
    logger: coreModuleApi.symbols.logger,
  });

  try {
    logger.info("Plugging random wallet");

    yield* call(() => ethManager.plugNewRandomWallet());

    logger.info("Generating new JWT token");

    yield* call(authModuleAPI.sagas.createJwt, []);

    logger.info("Creating new user");

    yield* call(loadOrCreateUser);

    const walletMetadata = yield* call(() => ethManager.getExistingWalletMetadata());
    // do not allow to start sign in without having existing wallet
    invariant(walletMetadata, "No existing wallet to sign in");

    yield put(authActions.signed(walletMetadata));

    logger.info("New account created");
  } catch (e) {
    yield put(authActions.failedToCreateAccount());

    yield put(
      notificationUIModuleApi.actions.showError(
        "New account wasn't created. If this issue persists, please contact support center.",
      ),
    );

    logger.error("New account creation failed", e);
  }
}

function* importNewAccount(
  action: TActionFromCreator<typeof authActions, typeof authActions.importAccount>,
): SagaGenerator<void> {
  const { ethManager, logger } = yield* neuGetBindings({
    ethManager: walletEthModuleApi.symbols.ethManager,
    logger: coreModuleApi.symbols.logger,
  });

  const { privateKeyOrMnemonic, forceReset, name } = action.payload;

  try {
    const importPhraseType = parseImportPhrase(privateKeyOrMnemonic);

    const hasExistingWallet = yield* call(() => ethManager.hasExistingWallet());

    // check if there is already existing wallet in storage
    invariant(
      !hasExistingWallet || forceReset,
      "Existing wallet already in storage. Use `forceReset` flag to clear the storage before importing new account",
    );

    if (forceReset && hasExistingWallet) {
      logger.info("Clearing existing wallet from storage");

      // before we can delete wallet and all metadata it should be plugged by ethManager
      yield* call(() => ethManager.plugExistingWallet());
      yield* call(() => ethManager.unsafeDeleteWallet());
    }

    logger.info(`Plugging new wallet from ${importPhraseType}`);

    switch (importPhraseType) {
      case EImportPhrase.PRIVATE_KEY:
        yield* call(() =>
          ethManager.plugNewWalletFromPrivateKey(toEthereumPrivateKey(privateKeyOrMnemonic), name),
        );

        break;
      case EImportPhrase.MNEMONICS:
        yield* call(() =>
          ethManager.plugNewWalletFromMnemonic(toEthereumHDMnemonic(privateKeyOrMnemonic), name),
        );

        break;
      default:
        throw new InvalidImportPhraseError();
    }

    logger.info("Generating new JWT token");

    yield* call(authModuleAPI.sagas.createJwt, []);

    logger.info("Creating or loading new user");

    yield* call(loadOrCreateUser);

    const walletMetadata = yield* call(() => ethManager.getExistingWalletMetadata());
    // do not allow to start sign in without having existing wallet
    invariant(walletMetadata, "No existing wallet to sign in");

    yield put(authActions.signed(walletMetadata));

    logger.info("New account imported");
  } catch (e) {
    yield put(authActions.failedToImportAccount());

    yield put(
      notificationUIModuleApi.actions.showError(
        "New account wasn't imported. If this issue persists, please contact support center.",
      ),
    );

    logger.error("Import account creation failed", e);
  }
}

function* logout(): SagaGenerator<void> {
  const { ethManager, logger } = yield* neuGetBindings({
    ethManager: walletEthModuleApi.symbols.ethManager,
    logger: coreModuleApi.symbols.logger,
  });

  try {
    logger.info("Logging out user");

    yield* call(authModuleAPI.sagas.resetUser);

    yield* call(() => ethManager.unsafeDeleteWallet());
  } catch (e) {
    logger.error("Failed to logout user", e);

    // TODO: Force to cleanup keychain state to not store any kind of user data even in case of error
  }
}

export function* authSaga(): SagaGenerator<void> {
  yield takeLeading(authActions.createAccount, createNewAccount);
  yield takeLeading(authActions.importAccount, importNewAccount);
  yield takeLeading(authActions.unlockAccount, signInExistingAccount);
  yield takeLeading(authActions.logout, logout);
}
