import { call, put, SagaGenerator, takeEvery } from "@neufund/sagas";

import { neuGetBindings } from "../../../utils";
import { coreModuleApi } from "../../core/module";
import { symbols } from "../lib/symbols";
import { EWalletType, IUser, IUserInput } from "../lib/users/interfaces";
import { UserNotExisting } from "../lib/users/UsersApi";
import { userActions } from "./actions";
import { TLoadOrCreateOptions } from "./types";

/**
 * A wrapper around UsersApi me method
 *
 * @returns IUser if the user exists and undefined if the user doesn't exist
 *
 * @note This is used when `UserNotExisting` is expected to happen and relying on catch as
 * a regular flow disrupts the linear flow of the saga
 *
 * @see loadOrCreateUser
 */
function* getUsersMeFromApi(): SagaGenerator<IUser | undefined> {
  const { apiUserService } = yield* neuGetBindings({
    apiUserService: symbols.apiUserService,
  });

  try {
    return yield* call(() => apiUserService.me());
  } catch (error) {
    if (error instanceof UserNotExisting) {
      return undefined;
    } else {
      throw error;
    }
  }
}

/**
 * @generator create or load the user depending on the response coming from `usersApi/me` method
 */
export function* loadOrCreateUser({
  userType,
  walletMetadata,
  email,
  salt,
  backupCodesVerified = false,
}: TLoadOrCreateOptions): SagaGenerator<void> {
  const { apiUserService } = yield* neuGetBindings({
    apiUserService: symbols.apiUserService,
  });

  const userFromApi = yield* call(getUsersMeFromApi);

  let user;
  if (userFromApi) {
    // we should update wallet in case of
    // 1. there's a new e-mail provided ie. during recovery or when user re-registers existing wallet
    // 2. when wallet type/subtype changes ie. someone moves from lightwallet to metamask via key import
    // 3. backup codes verified flag is set. it cannot be used to unset value
    if (
      email ||
      backupCodesVerified === true ||
      userFromApi.walletType !== walletMetadata.walletType ||
      userFromApi.walletSubtype !== walletMetadata.walletSubType
    ) {
      //TODO: we need to clean-up the logic above as mentioned in
      // @See https://github.com/Neufund/platform-frontend/issues/4312
      user = yield* call(apiUserService.updateUser, {
        ...userFromApi,
        salt,
        walletType: walletMetadata.walletType,
        walletSubtype: walletMetadata.walletSubType,
        newEmail: email,
        backupCodesVerified: backupCodesVerified || userFromApi.backupCodesVerified,
      });
    } else {
      user = userFromApi;
    }
  } else {
    user = yield* call(apiUserService.createAccount, {
      newEmail: email || walletMetadata?.email,
      backupCodesVerified:
        backupCodesVerified || walletMetadata?.walletType === EWalletType.LIGHT ? false : true,
      salt: salt || walletMetadata?.salt,
      type: userType,
      walletType: walletMetadata.walletType,
      walletSubtype: walletMetadata.walletSubType,
    });
  }

  yield put(userActions.setUser(user));
}

export function* updateUser(updatedUser: IUserInput): SagaGenerator<void> {
  const { apiUserService } = yield* neuGetBindings({
    apiUserService: symbols.apiUserService,
  });

  const user = yield* call(apiUserService.updateUser, updatedUser);

  yield put(userActions.setUser(user));
}

export function* loadUser(): SagaGenerator<void> {
  const { apiUserService } = yield* neuGetBindings({
    apiUserService: symbols.apiUserService,
  });

  const user = yield* call(apiUserService.me);

  yield put(userActions.setUser(user));
}

function* setLoggerUser(
  action: ReturnType<typeof userActions.setUser> | ReturnType<typeof userActions.reset>,
): SagaGenerator<void> {
  const { logger } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
  });

  if (action.type === userActions.setUser.getType()) {
    const user = action.payload.user;

    logger.info("Setting logged in user for logger");

    logger.setUser({ id: user.userId, type: user.type, walletType: user.walletType });
  } else {
    logger.info("Removing logged in user for logger");

    logger.setUser(null);
  }
}

export function* resetUser(): SagaGenerator<void> {
  const { logger } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
  });

  yield put(userActions.reset());

  logger.info("User has been cleared out");
}

export function* authUserSagas(): SagaGenerator<void> {
  yield takeEvery([userActions.setUser, userActions.reset], setLoggerUser);
}
