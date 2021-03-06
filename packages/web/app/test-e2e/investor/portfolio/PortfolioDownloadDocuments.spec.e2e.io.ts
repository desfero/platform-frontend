import { etoFixtureAddressByName } from "../../utils/index";
import { goToPortfolio } from "../../utils/navigation";
import { tid } from "../../utils/selectors";
import { loginFixtureAccount } from "../../utils/userHelpers";

describe("Download documents from portfolio", () => {
  it("should download available documents #portfolio #p3", () => {
    const PUBLIC_ETO_ID = etoFixtureAddressByName("ETOInPayoutState");
    loginFixtureAccount("INV_ICBM_ETH_M_HAS_KYC_DUP");
    goToPortfolio();

    cy.get(tid(`modals.portfolio.portfolio-assets.download-agreements-${PUBLIC_ETO_ID}`))
      .click()
      .then(() => {
        const downloadSelector = tid(
          `modals.portfolio.portfolio-assets.download-agreements-${PUBLIC_ETO_ID}.download`,
        );
        cy.clock().then(clock => {
          cy.get(downloadSelector)
            .first()
            .click()
            .then(() => {
              cy.get(downloadSelector)
                .first()
                .should("be.disabled");
            });

          // restore clock to native to have all sagas invoked
          clock.restore();

          cy.get(downloadSelector)
            .first()
            .should("not.be.disabled");
        });
      });
  });
});
