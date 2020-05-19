import {
  goToDashboard,
  goToEtoDocuments,
  goToEtoPreview,
  goToNomineeDashboard,
  goToProfile,
  goToWallet,
  loginFixtureAccount,
  tid,
} from "../utils";

describe("Issuer", () => {
  beforeEach(() => {
    loginFixtureAccount("NOMINEE_NEUMINI");
  });
  it("should render dashboard", () => {
    goToNomineeDashboard();

    cy.screenshot();
  });

  it("should render eto page", () => {
    goToEtoPreview();

    cy.awaitedScreenshot(tid("eto.public-view"));
  });

  it("should render documents", () => {
    goToEtoDocuments();

    cy.awaitedScreenshot(tid("documents.actions.download"));
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
