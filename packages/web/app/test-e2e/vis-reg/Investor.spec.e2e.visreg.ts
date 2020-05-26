import {
  goToDashboard,
  goToPortfolio,
  goToProfile,
  goToWallet,
  loginFixtureAccount,
  tid,
} from "../utils";

describe("Investor", () => {
  beforeEach(() => {
    loginFixtureAccount("INV_ICBM_ETH_M_HAS_KYC_DUP_2");
  });

  it("should render dashboard", () => {
    goToDashboard();

    cy.get(tid("my-neu-widget-neumark-balance.large-value")).should("exist");

    cy.awaitedScreenshot(tid("dashboard-eto-list"));
  });

  it("should render portfolio", () => {
    goToPortfolio();

    cy.get(tid("token-details-NOMERA-view-profile")).should("exist");

    cy.screenshot();
  });

  it("should render wallet", () => {
    goToWallet();
    cy.awaitedScreenshot(tid("transactions-history"));
  });

  it("should render profile", () => {
    goToProfile();

    cy.screenshot();
  });
});
