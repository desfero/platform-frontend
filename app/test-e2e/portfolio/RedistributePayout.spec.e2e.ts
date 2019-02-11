import { INV_EUR_ICBM_HAS_KYC_SEED } from "../fixtures";
import { closeModal, confirmAccessModal, goToPortfolio } from "../utils";
import { tid } from "../utils/selectors";
import { createAndLoginNewUser } from "../utils/userHelpers";

describe("Investor redistribute payout", () => {
  beforeEach(() =>
    createAndLoginNewUser({
      type: "investor",
      kyc: "business",
      seed: INV_EUR_ICBM_HAS_KYC_SEED,
      clearPendingTransactions: true,
    }));

  it("eth payout", () => {
    goToPortfolio();

    cy.get(tid(`asset-portfolio.payout-eth`)).within(() => {
      // redistribute eth payout
      cy.get(tid("asset-portfolio.payout.redistribute-payout")).click();
    });

    // confirm redistribute
    cy.get(tid("investor-payout.redistribute-confirm.confirm")).click();

    // accept summary
    cy.get(tid("investor-payout.redistribute-summary.accept")).click();
    confirmAccessModal();

    // wait for success
    cy.get(tid("investor-payout.accept-success"));
    closeModal();

    // assert that payout is removed from the list
    cy.get(tid(`asset-portfolio.payout-eth`)).should("not.exist");
  });

  it("nEUR payout", () => {
    goToPortfolio();

    cy.get(tid(`asset-portfolio.payout-eur_t`)).within(() => {
      // accept neur payout
      cy.get(tid("asset-portfolio.payout.redistribute-payout")).click();
    });

    // confirm redistribute
    cy.get(tid("investor-payout.redistribute-confirm.confirm")).click();

    // accept summary
    cy.get(tid("investor-payout.redistribute-summary.accept")).click();
    confirmAccessModal();

    // wait for success
    cy.get(tid("investor-payout.accept-success"));
    closeModal();

    // assert that payout is removed from the list
    cy.get(tid(`asset-portfolio.payout-eur_t`)).should("not.exist");
  });
});
