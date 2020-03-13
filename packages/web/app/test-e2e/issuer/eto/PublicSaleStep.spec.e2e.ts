import { goToIssuerDashboard, loginFixtureAccount, tid } from "../../utils/index";
import { assertPublicStep } from "./EtoRegistrationUtils";

describe("Eto public state", () => {
  it("should not show bookbuilding stats after presale #eto #p3", () => {
    loginFixtureAccount("ISSUER_PUBLIC");

    goToIssuerDashboard();

    assertPublicStep();

    cy.get(tid("settings.fundraising-statistics")).should("exist");
    cy.get(tid("settings.presale-counter")).should("not.exist");
    cy.get(tid("settings.public-sale-counter")).should("exist");

    cy.get(tid("bookbuilding-widget.closed")).should("not.exist");
  });
});
