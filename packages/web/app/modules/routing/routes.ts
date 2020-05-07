import { put } from "@neufund/sagas";
import { RouterState } from "connected-react-router";
import { Location } from "history";
import { matchPath } from "react-router";

import { appRoutes } from "../../components/appRoutes";
import { profileRoutes } from "../../components/settings/routes";
import { e2eRoutes } from "../../components/testing/e2eRoutes";
import { walletLoginRoutes } from "../../components/wallet-selector/WalletSelectorLogin/wallet-routes";
import { TGlobalDependencies } from "../../di/setupBindings";
import { EUserType } from "../../lib/api/users/interfaces";
import { actions } from "../actions";
import { TEtoWithCompanyAndContract } from "../eto/types";
import { neuCall } from "../sagasUtils";
import { redirectToBrowserWallet as redirectIfBrowserWalletExists } from "./redirects/sagas";
import { walletSelectorRegisterRedirect } from "./redirects/utils";
import { GREYP_PREVIEW_CODE, routeAction, routeInternal } from "./sagas";
import {
  TEtoPublicViewByIdLegacyRoute,
  TEtoPublicViewLegacyRouteMatch,
  TEtoViewByIdMatch,
  TEtoViewByPreviewCodeMatch,
} from "./types";

export const routes = [
  // most routes here are stubbed until we move them all to sagas
  // and provide a meaningful action on match

  /* --------- TEMP HARDCODED ROUTES ---------- */
  redirectGreypWithoutJurisdiction,
  greypRoute,
  /* ----------------------------------------- */

  legacyEtoViewRedirect,
  legacyEtoViewByIdRedirect,

  etoViewIssuerStatsRoute,
  etoViewIssuerRoute,
  etoViewRoute,
  etoViewByIdRoute,

  rootRoute,
  documentsRoute,
  dashboardRoute,
  registerRoute,
  registerWithLightWalletRoute,
  registerWithBrowserWalletRoute,
  registerWithLedgerRoute,
  loginWalletConnectRoute,
  loginRoute,
  restoreRoute,
  profileRoute,
  etoRegister,
  etoWidgetViewRoute,
  portfolioRoute,
  icbmMigrationRoute,
  walletUnlockRoute,
  walletRoute,
  verifyEmailRoute,
  seedBackupRoute,
  kycRoute,
  unsubscriptionSuccessRoute,
  unsubscriptionRoute,

  etoLandingRoute,
  registerIssuerRoute,
  registerIssuerWithLightWalletRoute,
  registerIssuerWithBrowserWalletRoute,
  registerIssuerWithLedgerRoute,
  loginIssuerRoute,
  restoreIssuerRoute,

  registerNomineeRoute,
  registerNomineeWithLightWalletRoute,
  registerNomineeWithBrowserWalletRoute,
  registerNomineeWithLedgerRoute,
  loginNomineeRoute,
  restoreNomineeRoute,

  //---test routes
  testEtoWidgetViewRoute,
  testCriticalErrorRoute,
  //----

  fallbackRedirect,
];

//-----------------  //
// ROUTE DEFINITIONS //
//-----------------  //

/*
 * most of the route actions are stubbed (set to undefined) now until we move entire routing to sagas.
 * UNDEFINED as a route action means the whole saga just returns and then the legacy routing kicks in.
 * */

export function* greypRoute(payload: RouterState): Generator<any, any, any> {
  const greypMatch = yield matchPath<any>(payload.location.pathname, {
    path: appRoutes.greypWithJurisdiction,
  });
  yield routeAction(greypMatch, {
    notAuth: put(actions.etoView.loadNotAuthorizedEtoView(GREYP_PREVIEW_CODE, greypMatch)),
    investor: put(actions.etoView.loadInvestorEtoView(GREYP_PREVIEW_CODE, greypMatch)),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* etoViewRoute(payload: RouterState): Generator<any, any, any> {
  const etoViewMatch = yield matchPath<TEtoViewByPreviewCodeMatch>(payload.location.pathname, {
    path: appRoutes.etoPublicView,
  });

  return yield routeAction(etoViewMatch, {
    notAuth: put(
      actions.etoView.loadNotAuthorizedEtoView(etoViewMatch?.params.previewCode, etoViewMatch),
    ),
    investor: put(
      actions.etoView.loadInvestorEtoView(etoViewMatch?.params.previewCode, etoViewMatch),
    ),
    issuer: put(
      actions.etoView.loadIssuerPreviewEtoView(etoViewMatch?.params.previewCode, etoViewMatch),
    ),
    nominee: put(actions.etoView.loadNomineeEtoView(etoViewMatch)),
  });
}

export function* etoViewIssuerStatsRoute(payload: RouterState): Generator<any, any, any> {
  const etoViewStatsMatch = yield matchPath<TEtoViewByPreviewCodeMatch>(payload.location.pathname, {
    path: appRoutes.etoIssuerViewStats,
    exact: true,
  });
  return yield routeAction(etoViewStatsMatch, {
    notAuth: put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.etoView.loadIssuerEtoView()),
    nominee: put(actions.etoView.loadNomineeEtoView(etoViewStatsMatch)),
  });
}

export function* etoViewIssuerRoute(payload: RouterState): Generator<any, any, any> {
  const etoViewMatch = yield matchPath<TEtoViewByPreviewCodeMatch>(payload.location.pathname, {
    path: appRoutes.etoIssuerView,
    exact: true,
  });
  return yield routeAction(etoViewMatch, {
    notAuth: put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.etoView.loadIssuerEtoView()),
    nominee: put(actions.etoView.loadNomineeEtoView(etoViewMatch)),
  });
}

export function* etoViewByIdRoute(payload: RouterState): Generator<any, any, any> {
  const etoViewByIdMatch = yield matchPath<TEtoViewByIdMatch>(payload.location.pathname, {
    path: appRoutes.etoPublicViewById,
  });
  return yield routeAction(etoViewByIdMatch, {
    notAuth: put(
      actions.etoView.loadNotAuthorizedEtoViewById(
        etoViewByIdMatch?.params.etoId,
        etoViewByIdMatch,
      ),
    ),
    investor: put(
      actions.etoView.loadInvestorEtoViewById(etoViewByIdMatch?.params.etoId, etoViewByIdMatch),
    ),
    issuer: put(
      actions.etoView.loadIssuerPreviewEtoViewById(
        etoViewByIdMatch?.params.etoId,
        etoViewByIdMatch,
      ),
    ),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* etoWidgetViewRoute(payload: RouterState): Generator<any, any, any> {
  const etoWidgetViewMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.etoWidgetView,
  });
  return yield routeAction(etoWidgetViewMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: undefined,
    nominee: undefined,
  });
}

export function* portfolioRoute(payload: RouterState): Generator<any, any, any> {
  const portfolioMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.portfolio,
  });
  return yield routeAction(portfolioMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* icbmMigrationRoute(payload: RouterState): Generator<any, any, any> {
  const icbmMigrationMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.icbmMigration,
  });
  return yield routeAction(icbmMigrationMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* walletUnlockRoute(payload: RouterState): Generator<any, any, any> {
  const walletUnlockMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.walletUnlock,
  });
  return yield routeAction(walletUnlockMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* walletRoute(payload: RouterState): Generator<any, any, any> {
  const walletMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.wallet,
  });
  return yield routeAction(walletMatch, {
    notAuth: undefined,
    investor: put(actions.walletView.loadWalletView()),
    issuer: put(actions.walletView.loadWalletView()),
    nominee: put(actions.walletView.loadWalletView()),
  });
}

export function* documentsRoute(payload: RouterState): Generator<any, any, any> {
  const documentsMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.documents,
  });
  return yield routeAction(documentsMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: undefined,
    nominee: put(actions.nomineeFlow.nomineeDocumentsView()),
  });
}

export function* dashboardRoute(payload: RouterState): Generator<any, any, any> {
  const dashboardMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.dashboard,
    exact: true,
  });
  return yield routeAction(dashboardMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: undefined,
    nominee: put(actions.nomineeFlow.nomineeDashboardView()),
  });
}

export function* etoRegister(payload: RouterState): Generator<any, any, any> {
  const dashboardMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.etoRegister,
  });
  return yield routeAction(dashboardMatch, {
    notAuth: undefined,
    investor: put(actions.routing.goToDashboard()),
    issuer: undefined,
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* verifyEmailRoute(payload: RouterState): Generator<any, any, any> {
  const verifyEmailMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.verify,
  });
  return yield routeAction(verifyEmailMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: undefined,
    nominee: undefined,
  });
}

export function* profileRoute(payload: RouterState): Generator<any, any, any> {
  const profileMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.profile,
    exact: true,
  });
  return yield routeAction(profileMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: undefined,
    nominee: undefined,
  });
}

export function* seedBackupRoute(payload: RouterState): Generator<any, any, any> {
  const seedBackupMatch = yield matchPath(payload.location.pathname, {
    path: profileRoutes.seedBackup,
    exact: true,
  });
  return yield routeAction(seedBackupMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: undefined,
    nominee: undefined,
  });
}

export function* kycRoute(payload: RouterState): Generator<any, any, any> {
  const kycMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.kyc,
  });
  return yield routeAction(kycMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: undefined,
    nominee: undefined,
  });
}

export function* unsubscriptionSuccessRoute(payload: RouterState): Generator<any, any, any> {
  const unsubscriptionSuccessMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.unsubscriptionSuccess,
  });
  return yield routeAction(unsubscriptionSuccessMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: undefined,
    nominee: undefined,
  });
}

export function* unsubscriptionRoute(payload: RouterState): Generator<any, any, any> {
  const unsubscriptionMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.unsubscription,
  });
  return yield routeAction(unsubscriptionMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: undefined,
    nominee: undefined,
  });
}

export function* rootRoute(payload: RouterState): Generator<any, any, any> {
  const rootMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.root,
    exact: true,
  });
  return yield routeAction(rootMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: undefined,
    nominee: undefined,
  });
}

export function* registerRoute(payload: RouterState): Generator<any, any, any> {
  const routeMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.register,
    exact: true,
  });
  return yield routeAction(routeMatch, {
    notAuth: put(walletSelectorRegisterRedirect(EUserType.INVESTOR)),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* registerWithLightWalletRoute(payload: RouterState): Generator<any, any, any> {
  const routeMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.registerWithLightWallet,
    exact: true,
  });

  return yield redirectIfBrowserWalletExists(
    routeAction(routeMatch, {
      notAuth: put(actions.routing.goToRegisterBrowserWallet()),
      investor: put(actions.routing.goToDashboard()),
      issuer: put(actions.routing.goToDashboard()),
      nominee: put(actions.routing.goToDashboard()),
    }),
    routeAction(routeMatch, {
      notAuth: put(actions.walletSelector.registerWithLightWallet(EUserType.INVESTOR)),
      investor: put(actions.routing.goToDashboard()),
      issuer: put(actions.routing.goToDashboard()),
      nominee: put(actions.routing.goToDashboard()),
    }),
  );
}

export function* registerWithBrowserWalletRoute(payload: RouterState): Generator<any, any, any> {
  const routeMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.registerWithBrowserWallet,
    exact: true,
  });
  return yield routeAction(routeMatch, {
    notAuth: put(actions.walletSelector.registerWithBrowserWallet(EUserType.INVESTOR)),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* registerWithLedgerRoute(payload: RouterState): Generator<any, any, any> {
  const routeMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.registerWithLedger,
  });
  return yield routeAction(routeMatch, {
    notAuth: put(actions.walletSelector.registerWithLedger(EUserType.INVESTOR)),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* loginWalletConnectRoute(payload: RouterState): Generator<any, any, any> {
  const routeMatch = yield matchPath(payload.location.pathname, {
    path: `${appRoutes.walletconnect}${process.env.NF_WALLET_CONNECT_LINK}`,
    exact: true,
  });
  return yield routeAction(routeMatch, {
    notAuth: put(
      process.env.NF_WALLET_CONNECT_ENABLED === "1"
        ? actions.walletSelector.walletConnectStart()
        : actions.routing.goHome(),
    ),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* loginRoute(payload: RouterState): Generator<any, any, any> {
  const loginMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.login,
  });

  const matchLedgerRoute = yield matchPath(payload.location.pathname, {
    path: walletLoginRoutes.ledger,
  });

  const matchBrowserRoute = yield matchPath(payload.location.pathname, {
    path: walletLoginRoutes.browser,
  });

  if (matchLedgerRoute) {
    yield put(actions.walletSelector.loginWithLedger());
  }

  if (matchBrowserRoute) {
    yield put(actions.walletSelector.browserWalletSignMessage());
  }

  return yield routeAction(loginMatch, {
    notAuth: undefined,
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* restoreRoute(payload: RouterState): Generator<any, any, any> {
  const restoreMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.restore,
  });
  return yield routeAction(restoreMatch, {
    notAuth: put(actions.walletSelector.restoreLightWallet()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* etoLandingRoute(payload: RouterState): Generator<any, any, any> {
  const etoLandingMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.etoLanding,
  });
  return yield routeAction(etoLandingMatch, {
    notAuth: put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* registerIssuerRoute(payload: RouterState): Generator<any, any, any> {
  const registerIssuerMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.registerIssuer,
    exact: true,
  });
  return yield routeAction(registerIssuerMatch, {
    notAuth:
      process.env.NF_ISSUERS_ENABLED === "1"
        ? put(walletSelectorRegisterRedirect(EUserType.ISSUER))
        : put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* registerIssuerWithLightWalletRoute(
  payload: RouterState,
): Generator<any, any, any> {
  const registerIssuerMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.registerIssuerWithLightWallet,
  });
  return yield routeAction(registerIssuerMatch, {
    notAuth:
      process.env.NF_ISSUERS_ENABLED === "1"
        ? put(actions.walletSelector.registerWithLightWallet(EUserType.ISSUER))
        : put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* registerIssuerWithBrowserWalletRoute(
  payload: RouterState,
): Generator<any, any, any> {
  const registerIssuerMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.registerIssuerWithBrowserWallet,
  });
  return yield routeAction(registerIssuerMatch, {
    notAuth:
      process.env.NF_ISSUERS_ENABLED === "1"
        ? put(actions.walletSelector.registerWithBrowserWallet(EUserType.ISSUER))
        : put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* registerIssuerWithLedgerRoute(payload: RouterState): Generator<any, any, any> {
  const registerIssuerMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.registerIssuerWithLedger,
  });
  return yield routeAction(registerIssuerMatch, {
    notAuth:
      process.env.NF_ISSUERS_ENABLED === "1"
        ? put(actions.walletSelector.registerWithLedger(EUserType.ISSUER))
        : put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* loginIssuerRoute(payload: RouterState): Generator<any, any, any> {
  const loginIssuerMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.loginIssuer,
  });
  return yield routeAction(loginIssuerMatch, {
    notAuth:
      process.env.NF_ISSUERS_ENABLED === "1"
        ? put(actions.routing.goToLogin(undefined))
        : put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* restoreIssuerRoute(payload: RouterState): Generator<any, any, any> {
  const restoreIssuerMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.restoreIssuer,
  });
  return yield routeAction(restoreIssuerMatch, {
    notAuth:
      process.env.NF_ISSUERS_ENABLED === "1"
        ? put(actions.routing.goToPasswordRecovery())
        : put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* registerNomineeRoute(payload: RouterState): Generator<any, any, any> {
  const registerNomineeMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.registerNominee,
    exact: true,
  });
  return yield routeAction(registerNomineeMatch, {
    notAuth:
      process.env.NF_NOMINEE_ENABLED === "1"
        ? put(walletSelectorRegisterRedirect(EUserType.NOMINEE))
        : put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* registerNomineeWithLightWalletRoute(
  payload: RouterState,
): Generator<any, any, any> {
  const routeMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.registerNomineeWithLightWallet,
  });
  return yield routeAction(routeMatch, {
    notAuth:
      process.env.NF_NOMINEE_ENABLED === "1"
        ? put(actions.walletSelector.registerWithLightWallet(EUserType.NOMINEE))
        : put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* registerNomineeWithBrowserWalletRoute(
  payload: RouterState,
): Generator<any, any, any> {
  const routeMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.registerNomineeWithBrowserWallet,
  });
  return yield routeAction(routeMatch, {
    notAuth:
      process.env.NF_NOMINEE_ENABLED === "1"
        ? put(actions.walletSelector.registerWithBrowserWallet(EUserType.NOMINEE))
        : put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* registerNomineeWithLedgerRoute(payload: RouterState): Generator<any, any, any> {
  const routeMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.registerNomineeWithLedger,
  });
  return yield routeAction(routeMatch, {
    notAuth:
      process.env.NF_NOMINEE_ENABLED === "1"
        ? put(actions.walletSelector.registerWithLedger(EUserType.NOMINEE))
        : put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* loginNomineeRoute(payload: RouterState): Generator<any, any, any> {
  const loginNomineeMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.loginNominee,
  });
  return yield routeAction(loginNomineeMatch, {
    notAuth:
      process.env.NF_NOMINEE_ENABLED === "1"
        ? put(actions.routing.goToLogin(undefined))
        : put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* restoreNomineeRoute(payload: RouterState): Generator<any, any, any> {
  const restoreNomineeMatch = yield matchPath(payload.location.pathname, {
    path: appRoutes.restoreNominee,
  });
  return yield routeAction(restoreNomineeMatch, {
    notAuth:
      process.env.NF_NOMINEE_ENABLED === "1"
        ? put(actions.routing.goToPasswordRecovery())
        : put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}

export function* testEtoWidgetViewRoute(payload: RouterState): Generator<any, any, any> {
  const etoWidgetViewMatch = yield matchPath(payload.location.pathname, {
    path: e2eRoutes.embeddedWidget,
  });
  return yield routeAction(etoWidgetViewMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: undefined,
    nominee: undefined,
  });
}

export function* testCriticalErrorRoute(payload: RouterState): Generator<any, any, any> {
  const etoWidgetViewMatch = yield matchPath(payload.location.pathname, {
    path: e2eRoutes.criticalError,
  });
  return yield routeAction(etoWidgetViewMatch, {
    notAuth: undefined,
    investor: undefined,
    issuer: undefined,
    nominee: undefined,
  });
}

export function* redirectLegacyEtoView(
  { apiEtoService }: TGlobalDependencies,
  location: Location,
): Generator<any, any, any> {
  const etoPublicViewLegacyRouteMatch = yield matchPath<TEtoPublicViewLegacyRouteMatch>(
    location.pathname,
    {
      path: appRoutes.etoPublicViewLegacyRoute,
      exact: true,
    },
  );

  if (etoPublicViewLegacyRouteMatch !== null) {
    const previewCode = yield etoPublicViewLegacyRouteMatch.params.previewCode;
    const eto: TEtoWithCompanyAndContract = yield apiEtoService.getEtoPreview(previewCode);
    yield put(actions.routing.goToEtoView(previewCode, eto.product.jurisdiction));
    return true;
  }
}

export function* redirectLegacyEtoViewById(
  { apiEtoService }: TGlobalDependencies,
  location: Location,
): Generator<any, any, any> {
  const etoPublicViewByIdLegacyRouteMatch = yield matchPath<TEtoPublicViewByIdLegacyRoute>(
    location.pathname,
    {
      path: appRoutes.etoPublicViewByIdLegacyRoute,
      exact: true,
    },
  );
  if (etoPublicViewByIdLegacyRouteMatch !== null) {
    const etoId = etoPublicViewByIdLegacyRouteMatch.params.etoId;
    const eto: TEtoWithCompanyAndContract = yield apiEtoService.getEto(etoId);
    yield put(actions.routing.goToEtoViewById(etoId, eto.product.jurisdiction));
    return true;
  }
}

export function* redirectGreypWithoutJurisdiction(payload: RouterState): Generator<any, any, any> {
  const greypWithoutJurisdictionMatch = yield matchPath<any>(payload.location.pathname, {
    path: appRoutes.greyp,
  });
  if (greypWithoutJurisdictionMatch !== null) {
    yield put(actions.routing.goToGreypWithJurisdiction());
    return true;
  }
}

export function* legacyEtoViewRedirect(payload: RouterState): Generator<any, any, any> {
  return yield neuCall(redirectLegacyEtoView, payload.location);
}

export function* legacyEtoViewByIdRedirect(payload: RouterState): Generator<any, any, any> {
  return yield neuCall(redirectLegacyEtoViewById, payload.location);
}

export function* fallbackRedirect(_: RouterState): Generator<any, any, any> {
  return yield routeInternal({
    notAuth: put(actions.routing.goHome()),
    investor: put(actions.routing.goToDashboard()),
    issuer: put(actions.routing.goToDashboard()),
    nominee: put(actions.routing.goToDashboard()),
  });
}
