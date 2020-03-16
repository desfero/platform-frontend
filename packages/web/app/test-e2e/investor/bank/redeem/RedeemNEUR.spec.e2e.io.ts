import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  formatNumber,
  selectDecimalPlaces,
  stripNumberFormatting,
} from "@neufund/shared";
import BigNumber from "bignumber.js";

import { fillForm } from "../../../utils/forms";
import {
  assertWallet,
  confirmAccessModal,
  getWalletNEurAmount,
  goToWallet,
  parseAmount,
} from "../../../utils/index";
import { formField, tid } from "../../../utils/selectors";
import { loginFixtureAccount } from "../../../utils/userHelpers";
import { assertBankAccountDetails } from "../assertions";

describe("Redeem", function(): void {
  describe("Redeem Checks", function(): void {
    beforeEach(() => {
      loginFixtureAccount("demoinvestor2");
      // store actual balance
      getWalletNEurAmount().as("currentAmount");

      assertWallet();

      // check if bank account is linked
      assertBankAccountDetails();

      // start redeem flow
      cy.get(tid("wallet-balance.neur.redeem-button")).click();
    });

    it("should not allow to use value below 5 NEur #banking #p3 #flaky", () => {
      fillForm(
        {
          amount: "2.22",
        },
        { submit: false },
      );
      cy.get(tid("form.amount.error-message")).should("exist");
      cy.get(tid("bank-transfer.reedem-init.continue")).should("be.disabled");
    });

    it("should not allow to use value above NEur balance #banking #p3 #flaky", () => {
      fillForm(
        {
          amount: "9999999999.99",
        },
        { submit: false },
      );
      cy.get(tid("form.amount.error-message")).should("exist");
      cy.get(tid("bank-transfer.reedem-init.continue")).should("be.disabled");
    });

    it("should correctly format input #banking #p3 @flaky", () => {
      const value = "-3s32aa@fax2.24@#2535%s9sf92";

      fillForm(
        {
          amount: value,
        },
        { submit: false },
      );
      cy.get(tid("form.amount.error-message")).should("exist");
      cy.get(tid("bank-transfer.reedem-init.continue")).should("be.disabled");

      const nextValue = "123456789.99";

      fillForm(
        {
          amount: nextValue,
        },
        { submit: false },
      );

      const nextExpectedValue = formatNumber({
        value: nextValue,
        outputFormat: ENumberOutputFormat.FULL,
        inputFormat: ENumberInputFormat.FLOAT,
        decimalPlaces: selectDecimalPlaces(ECurrency.EUR),
      });

      cy.get(formField("amount")).should("have.value", nextExpectedValue);
    });

    it("should work correctly on redeem modal after initializing new bank account #banking #p3 #flaky", () => {
      fillForm(
        {
          amount: "124",
        },
        { submit: false },
      );

      // search only for button inside modal
      cy.get(".modal-content").within(() => {
        cy.get(tid("locked-wallet.neur.bank-account.link-account")).click();
      });

      // close bank account link modal
      cy.get(tid("bank-transfer.summary.transfer-completed")).click();

      cy.get(tid("modal-close-button"))
        .last()
        .click();

      fillForm(
        {
          amount: "532",
        },
        { submit: false },
      );

      cy.get(tid("bank-transfer.redeem.init.fee")).within(() => {
        cy.get(tid("value")).should("not.contain", "0");
      });
    });
  });

  describe("Redeem Transaction", function(): void {
    const redeemAmount = "5";
    beforeEach(() => {
      loginFixtureAccount("INV_HAS_EUR_HAS_KYC_2");
      // store actual balance
      getWalletNEurAmount().as("currentAmount");

      assertWallet();

      // check if bank account is linked
      assertBankAccountDetails();

      // start redeem flow
      cy.get(tid("wallet-balance.neur.redeem-button")).click();
    });

    it("should withdraw successfully #banking #p1 #flaky", () => {
      cy.get(tid("bank-transfer.reedem-init.redeem-form-label")).type(redeemAmount);

      fillForm({
        "bank-transfer.reedem-init.continue": { type: "submit" },
      });

      // check if value is the same in summary
      cy.get(tid("bank-transfer.redeem-summary.return-amount")).then($el => {
        const redeemedAmount = parseAmount(stripNumberFormatting($el.text()));

        expect(redeemAmount).to.bignumber.bignumber.eq(redeemedAmount);
      });

      // continue transaction
      cy.get(tid("bank-transfer.redeem-summary.continue")).click();
      confirmAccessModal();

      // go to wallet
      cy.get(tid("bank-transfer.redeem.success.go-to-wallet")).click();

      // refresh page instead of waiting to have data updated
      goToWallet();

      // check if balance is 0
      cy.get<BigNumber>("@currentAmount").then(previousAmount => {
        getWalletNEurAmount(false).then(actualAmount => {
          expect(actualAmount).to.bignumber.bignumber.eq(
            new BigNumber(previousAmount).minus(redeemAmount),
          );
        });
      });
    });
  });
});
