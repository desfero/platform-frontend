import { EWalletType } from "@neufund/shared-modules";
import { RouterState } from "connected-react-router";
import { isString } from "lodash";
import * as queryString from "query-string";
import { createSelector } from "reselect";

import { appRoutes } from "../../components/appRoutes";
import { TAppGlobalState } from "../../store";

export const selectRouter = (state: TAppGlobalState) => state.router;

export const selectRedirectURLFromQueryString = createSelector(selectRouter, (state: RouterState):
  | string
  | undefined => {
  if (!(state.location && state.location.search)) {
    return undefined;
  }
  const { redirect } = queryString.parse(state.location.search);

  if (isString(redirect)) {
    return redirect;
  }

  return undefined;
});

// this is a workaround for #3942 (see QA's comment).
// TODO refactor after we move to route-based sagas
export const selectIsVerifyEmailRedirect = createSelector(
  selectRedirectURLFromQueryString,
  (redirect: string | undefined) => {
    const regex = new RegExp(`^${appRoutes.verify}`);
    return redirect !== undefined ? regex.test(redirect) : false;
  },
);

export const selectWalletTypeFromQueryString = createSelector(
  selectRouter,
  (state: RouterState): EWalletType => {
    if (!(state.location && state.location.search)) {
      return EWalletType.UNKNOWN;
    }

    const { wallet_type } = queryString.parse(state.location.search);

    const walletType: string | undefined = isString(wallet_type) ? wallet_type : undefined;

    switch (walletType) {
      case "ledger":
        return EWalletType.LEDGER;
      case "browser":
        return EWalletType.BROWSER;
      case "light":
        return EWalletType.LIGHT;
      default:
        return EWalletType.UNKNOWN;
    }
  },
);

export const selectHasRedirectedToBrowserAlready = (state: TAppGlobalState) =>
  state.routing.hasRedirectedToBrowserAlready;
