import { appRoutes } from "../../../components/appRoutes";
import { lightWalletTypePasswordAndLogin } from "../../utils/index";
import { tid } from "../../utils/selectors";
import { DEFAULT_PASSWORD, loginFixtureAccount } from "../../utils/userHelpers";

describe("Portfolio Stats", () => {
  it("should show loading without no assets message when logged in starting from landing @dashboard #portfolio-stats #p3", () => {
    cy.visit(appRoutes.root);

    cy.get(tid("dashboard-eto-list")).should("exist");

    loginFixtureAccount("INV_HAS_EUR_HAS_KYC");

    cy.get(tid("Header-login")).click();
    lightWalletTypePasswordAndLogin(DEFAULT_PASSWORD);

    cy.get(tid("dashboard.portfolio-stats")).within(() => {
      cy.get(tid("loading-indicator-pulse")).should("exist");

      cy.get(tid("portfolio.stats.token-6-SHARES")).should("exist");
    });
  });
});
