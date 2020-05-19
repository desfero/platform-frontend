import {
  goToDashboard,
  goToEtoDocuments,
  goToEtoPreview,
  goToProfile,
  goToWallet,
  loginFixtureAccount,
  tid,
} from "../utils";

describe("Issuer", () => {
  beforeEach(() => {
    loginFixtureAccount("ISSUER_BLANK_DEMO_HAS_KYC");
  });

  it("should render dashboard", () => {
    goToDashboard(false);

    cy.awaitedScreenshot(tid("eto-state-preview"));
  });

  it("should render eto page", () => {
    goToEtoPreview();

    cy.awaitedScreenshot(tid("eto-state-preview"));
  });

  it("should render documents", () => {
    goToEtoDocuments();

    cy.awaitedScreenshot(tid("form.name.signed_termsheet"));
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
