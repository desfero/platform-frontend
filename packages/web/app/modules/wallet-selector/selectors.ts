import { EUserType } from "@neufund/shared-modules";
import { DeepReadonly, DeepReadonlyObject } from "@neufund/shared-utils";
import { RouterState } from "connected-react-router";
import { createSelector } from "reselect";

import { appRoutes } from "../../components/appRoutes";
import { TMessage } from "../../components/translatedMessages/utils";
import { TAppGlobalState } from "../../store";
import {
  ECommonWalletRegistrationFlowState,
  ELedgerRegistrationFlowState,
  TGenericWalletFormValues,
  TLightWalletFormValues,
} from "./types";

export const selectUrlUserType = (router: RouterState): EUserType => {
  if (router.location && router.location.pathname.includes("eto")) {
    return EUserType.ISSUER;
  } else if (router.location && router.location.pathname.includes("nominee")) {
    return EUserType.NOMINEE;
  } else {
    return EUserType.INVESTOR;
  }
};

export const selectRouterState = (state: TAppGlobalState) => state.router;

export const selectLocation = createSelector(selectRouterState, router =>
  router && router.location ? router.location : undefined,
);

export const selectIsLoginRoute = (state: RouterState): boolean =>
  !!state.location && state.location.pathname.includes("login");

export const selectLedgerIsInitialConnectionInProgress = (state: TAppGlobalState): boolean =>
  state.ledgerWizardState.isInitialConnectionInProgress;

export const selectLedgerErrorMessage = (state: TAppGlobalState): TMessage | undefined =>
  state.ledgerWizardState.errorMsg;

export const selectRootPath = (state: RouterState): string => {
  switch (selectUrlUserType(state)) {
    case EUserType.ISSUER:
      return selectIsLoginRoute(state) ? appRoutes.login : appRoutes.registerIssuer;
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

export const selectUIState = (state: TAppGlobalState): ELedgerRegistrationFlowState =>
  state.walletSelector.uiState as ELedgerRegistrationFlowState;

export const selectWalletSelectorData = (state: TAppGlobalState) => state.walletSelector;

export const selectRegisterWalletType = (state: TAppGlobalState) => state.walletSelector.walletType;

export const selectRegisterWalletDefaultFormValues = (
  state: TAppGlobalState,
):
  | DeepReadonlyObject<TGenericWalletFormValues>
  | DeepReadonlyObject<TLightWalletFormValues>
  | undefined =>
  state.walletSelector.uiState !== ECommonWalletRegistrationFlowState.NOT_STARTED
    ? state.walletSelector.initialFormValues
    : undefined;

export const selectMessageSigningError = (
  state: TAppGlobalState,
): DeepReadonly<TMessage> | undefined => state.walletSelector.messageSigningError;

export const selectWalletConnectError = (state: TAppGlobalState) =>
  state.walletSelector.walletConnectError;
