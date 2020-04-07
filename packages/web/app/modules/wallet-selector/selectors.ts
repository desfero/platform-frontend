import { RouterState } from "connected-react-router";

import { DeepReadonly } from "../../../../shared/dist/utils/types";
import { appRoutes } from "../../components/appRoutes";
import { TMessage } from "../../components/translatedMessages/utils";
import { EUserType } from "../../lib/api/users/interfaces";
import { TAppGlobalState } from "../../store";

export const selectUrlUserType = (router: RouterState): EUserType => {
  if (router.location && router.location.pathname.includes("eto")) {
    return EUserType.ISSUER;
  } else if (router.location && router.location.pathname.includes("nominee")) {
    return EUserType.NOMINEE;
  } else {
    return EUserType.INVESTOR;
  }
};

export const selectIsLoginRoute = (state: RouterState): boolean =>
  !!state.location && state.location.pathname.includes("login");

export const selectRootPath = (state: RouterState): string => {
  switch (selectUrlUserType(state)) {
    case EUserType.ISSUER:
      return selectIsLoginRoute(state) ? appRoutes.loginIssuer : appRoutes.registerIssuer;
    case EUserType.NOMINEE:
      return selectIsLoginRoute(state) ? appRoutes.login : appRoutes.registerNominee;
    case EUserType.INVESTOR:
    default:
      return selectIsLoginRoute(state) ? appRoutes.login : appRoutes.register;
  }
};

export const selectOppositeRootPath = (state: RouterState): string =>
  selectIsLoginRoute(state) ? appRoutes.register : appRoutes.login;

export const selectIsMessageSigning = (state: TAppGlobalState): boolean =>
  state.walletSelector.isMessageSigning;

export const selectMessageSigningError = (
  state: TAppGlobalState,
): DeepReadonly<TMessage> | undefined => state.walletSelector.messageSigningError;

export const selectWalletConnectError = (state: TAppGlobalState) =>
  state.walletSelector.walletConnectError;
