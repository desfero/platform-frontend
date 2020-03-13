import { fillForm } from "../../../utils/forms";
import { goToIssuerDashboard } from "../../../utils/navigation";
import { formField, tid } from "../../../utils/selectors";
import { createAndLoginNewUser } from "../../../utils/userHelpers";
import { pushEtoDataToAPI, pushEtoToAPI } from "../utils";

describe("Eto Terms", () => {
  before(() => {
    createAndLoginNewUser({
      type: "issuer",
      kyc: "business",
    }).then(() => {
      cy.saveLocalStorage();
      pushEtoToAPI();
      pushEtoDataToAPI();
    });
  });
  beforeEach(() => {
    cy.restoreLocalStorage();
    goToIssuerDashboard();
  });
  it("should show 7 available products #eto #p3", () => {
    cy.get(`${tid("eto-progress-widget-eto-terms")} button`).click();

    cy.get(formField("productId")).should("have.length", 7);
  });

  it("should show product details on hover #eto #p3", () => {
    cy.get(`${tid("eto-progress-widget-eto-terms")} button`).click();

    cy.get(tid("eto-terms.product.hnwi-eto-de-vma.tooltip.trigger")).trigger("mouseover");

    cy.get(tid("eto-terms.product.hnwi-eto-de-vma.tooltip.popover")).should("exist");
  });

  it("should hide and show transferable toggle #eto #p3", () => {
    cy.get(`${tid("eto-progress-widget-eto-terms")} button`).click();

    // should not show transferable toggle
    fillForm(
      {
        productId: {
          value: "hnwi eto de vma",
          type: "radio",
        },
      },
      { submit: false },
    );

    cy.get(tid("eto-flow-product-changed-successfully")).should("exist");

    cy.get(formField("tokenTradeableOnSuccess")).should("not.exist");

    // should show transferable toggle
    fillForm(
      {
        productId: {
          value: "mini eto li",
          type: "radio",
        },
      },
      { submit: false },
    );

    cy.get(tid("eto-flow-product-changed-successfully")).should("exist");

    cy.get(formField("tokenTradeableOnSuccess")).should("exist");
  });
});
