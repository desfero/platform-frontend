import { generateSharedModuleId } from "../../utils";
import { jwtActions } from "./jwt/actions";
import { jwtReducerMap } from "./jwt/reducer";
import { authJwtSagas, createJwt, escalateJwt, loadJwt, refreshJWT, setJwt } from "./jwt/sagas";
import * as jwtSelectors from "./jwt/selectors";
import { EJwtPermissions } from "./jwt/types";
import { setupContainerModule } from "./lib/bindings";
import { AuthHttpClient, IAuthHttpClient } from "./lib/http/AuthHttpClient";
import { AuthJsonHttpClient } from "./lib/http/AuthJsonHttpClient";
import { SignatureAuthApi } from "./lib/signature/SignatureAuthApi";
import { symbols } from "./lib/symbols";
import {
  EUserType,
  EWalletSubType,
  EWalletType,
  IEmailStatus,
  IUser,
  IUserInput,
  IVerifyEmailUser,
} from "./lib/users/interfaces";
import {
  EmailActivationCodeMismatch,
  EmailAlreadyExists,
  UserNotExisting,
} from "./lib/users/UsersApi";
import { userActions } from "./user/actions";
import { userReducerMap } from "./user/reducer";
import { authUserSagas, loadOrCreateUser, loadUser, resetUser, updateUser } from "./user/sagas";
import * as userSelectors from "./user/selectors";

const MODULE_ID = generateSharedModuleId("auth");

type TModuleConfig = Parameters<typeof setupContainerModule>[0];

const reducerMap = {
  ...jwtReducerMap,
  ...userReducerMap,
};

const setupAuthModule = (config: TModuleConfig) => ({
  id: MODULE_ID,
  libs: [setupContainerModule(config)],
  sagas: [authUserSagas, authJwtSagas],
  reducerMap,
  api: authModuleAPI,
});

const authModuleAPI = {
  actions: {
    ...jwtActions,
    ...userActions,
  },
  symbols,
  selectors: {
    ...jwtSelectors,
    ...userSelectors,
  },
  sagas: {
    loadJwt,
    createJwt,
    setJwt,
    escalateJwt,
    refreshJWT,
    loadOrCreateUser,
    loadUser,
    updateUser,
    resetUser,
  },
  error: {
    EmailAlreadyExists,
    UserNotExisting,
    EmailActivationCodeMismatch,
  },
};

export {
  setupAuthModule,
  authModuleAPI,
  EJwtPermissions,
  AuthHttpClient,
  IAuthHttpClient,
  AuthJsonHttpClient,
  SignatureAuthApi,
  EWalletType,
  EWalletSubType,
  EUserType,
  IUser,
  IEmailStatus,
  IUserInput,
  IVerifyEmailUser,
};
