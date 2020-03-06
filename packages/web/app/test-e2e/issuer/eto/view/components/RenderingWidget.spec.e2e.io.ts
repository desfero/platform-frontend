import { etherscanAddressLink } from "../../../../../components/appRouteUtils";
import { assertIsExternalLink } from "../../../../utils/assertions";
import {
  accountFixtureAddress,
  createAndLoginNewUser,
  etoFixtureAddressByName,
  shouldDownloadDocument,
  tid,
} from "../../../../utils/index";
import { goToEtoViewById, goToIssuerEtoView } from "../EtoViewUtils";

const assertIsNonClickableTag = (testId: string) =>
  cy.get(tid(testId) + tid("tag.non-clickable")).should("exist");

describe("Eto view widget", () => {
  it("should render tags correctly when all documents are available and eto is on chain #eto #widget #p3", () => {
    const etoId = etoFixtureAddressByName("ETOInSetupState");

    goToEtoViewById(etoId);

    assertIsExternalLink("eto-overview-pitch-deck-button");

    cy.get(tid("eto-overview-pitch-deck-button")).should("have.attr", "href");

    shouldDownloadDocument("eto-overview-term-sheet-button", "Signed Termsheet.pdf");

    shouldDownloadDocument(
      "eto-overview-prospectus-approved-button",
      "Approved Offering Document.pdf",
    );

    assertIsExternalLink("eto-overview-smart-contract-on-chain-button");

    cy.get(tid("eto-overview-smart-contract-on-chain-button")).should(
      "have.attr",
      "href",
      etherscanAddressLink(etoId),
    );
  });

  it(
    "should render tags as non clickable when documents and pitch are not available " +
      "and eto is not on chain #eto #widget #p3",
    () => {
      createAndLoginNewUser({ type: "issuer", kyc: "business" });

      goToIssuerEtoView();

      assertIsNonClickableTag("eto-overview-pitch-deck-button");

      assertIsNonClickableTag("eto-overview-term-sheet-button");

      assertIsNonClickableTag("eto-overview-prospectus-approved-button");

      assertIsNonClickableTag("eto-overview-smart-contract-on-chain-button");
    },
  );

  it("should render eto stats for eto in pre-sale #eto #widget #p2", () => {
    const etoId = etoFixtureAddressByName("ETOInWhitelistState");

    goToEtoViewById(etoId);

    cy.get(tid("eto-overview.stats.pre-money-valuation")).contains("177 878 291 EUR");
    cy.get(tid("eto-overview.stats.target-investment-amount")).contains("2 966 338 EUR");
    cy.get(tid("eto-overview.stats.new-shares-generated")).contains("2.38–8.22 %");
    cy.get(tid("eto-overview.stats.equity-token-price")).contains("0.3390 EUR");
    cy.get(tid("eto-overview.stats.equity-token-price-whitelist-discount")).contains("20%");
  });

  it.skip("should render eto stats for eto in public-sale #eto #widget #p3", () => {
    const etoId = etoFixtureAddressByName("ETOInPublicState");

    goToEtoViewById(etoId);

    cy.get(tid("eto-overview.stats.pre-money-valuation")).contains("30 000 000 EUR");
    cy.get(tid("eto-overview.stats.target-investment-amount")).contains("1 660 227 EUR");
    cy.get(tid("eto-overview.stats.new-shares-generated")).contains("10.00–12.00 %");
    cy.get(tid("eto-overview.stats.equity-token-price")).contains("0.6000 EUR");
    cy.get(tid("eto-overview.stats.equity-token-price-public-discount")).should("not.exist");
  });

  it("should render TBA for coming soon state #eto #widget #p3", () => {
    const etoId = accountFixtureAddress("ISSUER_PREVIEW");

    goToEtoViewById(etoId);

    cy.get(tid("eto-overview.stats.pre-money-valuation")).contains("TBA");
    cy.get(tid("eto-overview.stats.target-investment-amount")).contains("TBA");
    cy.get(tid("eto-overview.stats.new-shares-generated")).contains("TBA");
    cy.get(tid("eto-overview.stats.equity-token-price")).contains("TBA");
    cy.get(tid("eto-overview.stats.equity-token-price-public-discount")).should("not.exist");
  });
});
