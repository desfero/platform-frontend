import { createActionFactory } from "@neufund/shared-utils";
import { goBack, push } from "connected-react-router";
import { LocationDescriptorObject, Path } from "history";

import { appRoutes } from "../../components/appRoutes";
import { etoPublicViewByIdLink, etoPublicViewLink } from "../../components/appRouteUtils";
import { kycRoutes } from "../../components/kyc/routes";
import { profileRoutes } from "../../components/settings/routes";
import { EJurisdiction } from "../../lib/api/eto/EtoProductsApi.interfaces";
import { TLoginRouterState } from "./types";

export const routingActions = {
  /* TEMP HARDCODED ROUTE */
  goToGreypWithJurisdiction: () => push(appRoutes.greypWithJurisdiction),
  /* ------- */

  // navigation primitives
  goBack,
  push: (location: Path | LocationDescriptorObject) => push(location as any),

  // default routes
  goHome: () => push(appRoutes.root),

  //kyc routes
  goToKYCHome: () => push(kycRoutes.start),
  goToKYCSuccess: () => push(kycRoutes.success),
  goToKYCIndividualStart: () => push(kycRoutes.individualStart),
  goToKYCIndividualDocumentVerification: () => push(kycRoutes.individualDocumentVerification),
  goToKYCIndividualAddress: () => push(kycRoutes.individualAddress),
  goToKYCIndividualFinancialDisclosure: () => push(kycRoutes.financialDisclosure),
  goToKYCIndividualUpload: () => push(kycRoutes.individualUpload),
  goToKYCBusinessUpload: () => push(kycRoutes.businessUpload),

  goToKYCLegalRepresentative: () => push(kycRoutes.legalRepresentative),
  goToKYCBusinessData: () => push(kycRoutes.businessData),
  goToKYCManagingDirectors: () => push(kycRoutes.managingDirectors),
  goToKYCBeneficialOwners: () => push(kycRoutes.beneficialOwners),

  // dashboard
  goToDashboard: () => push(appRoutes.dashboard),
  goToProfile: () => push(appRoutes.profile),

  // eto view
  goToEtoViewById: (etoId: string, jurisdiction: EJurisdiction) =>
    push(etoPublicViewByIdLink(etoId, jurisdiction)),
  goToEtoView: (previewCode: string, jurisdiction: EJurisdiction) =>
    push(etoPublicViewLink(previewCode, jurisdiction)),

  // registration
  goToRegister: () => push(appRoutes.register),
  goToRegisterBrowserWallet: () => push(appRoutes.registerWithBrowserWallet),
  goToLightWalletRegister: () => push(appRoutes.registerWithLightWallet),
  goToIssuerLightWalletRegister: () => push(appRoutes.registerIssuerWithLightWallet),
  goToNomineeLightWalletRegister: () => push(appRoutes.registerNomineeWithLightWallet),

  // login
  goToLogin: (state: TLoginRouterState) => push(appRoutes.login, state),
  goToLoginWithBrowserWalet: () => push(appRoutes.loginBrowserWallet),

  goToPasswordRecovery: () => push(appRoutes.restore),

  // wallet
  goToWallet: () => push(appRoutes.wallet),

  // external paths
  openInNewWindow: createActionFactory("OPEN_IN_NEW_WINDOW", (path: string) => ({ path })),

  // Portfolio
  goToPortfolio: () => push(appRoutes.portfolio),

  //seed backup
  goToSeedBackup: () => push(profileRoutes.seedBackup),

  // Marketing emails
  goToUnsubscriptionSuccess: () => push(appRoutes.unsubscriptionSuccess),

  // other...
  // TODO: Replace with a dedicated 404 page
  goTo404: () => push(appRoutes.root),

  /* Regular Actions */
  setBrowserAutoRedirect: createActionFactory(
    "ROUTING_SET_BROWSER_AUTO_REDIRECT",
    (hasRedirectedToBrowserAlready: boolean) => ({
      hasRedirectedToBrowserAlready,
    }),
  ),
};
