import { fillForm } from "../../utils/forms";
import { assertWallet, clearEmailServer, goToProfile, goToWallet } from "../../utils/index";
import { tid } from "../../utils/selectors";
import { createAndLoginNewUser, loginFixtureAccount } from "../../utils/userHelpers";

function assertBankTransferFlow({
  agreementApprovalRequired,
}: {
  agreementApprovalRequired: boolean;
}): void {
  if (agreementApprovalRequired) {
    cy.get(tid("bank-verification.link-now")).click();

    fillForm({
      quintessenceTosApproved: {
        type: "checkbox",
        values: { false: true },
      },
      nEurTosApproved: {
        type: "checkbox",
        values: { false: true },
      },
      "bank-verification.agree-with-tos": {
        type: "submit",
      },
    });
  }

  cy.get(tid("bank-transfer.summary.amount")).contains("1 EUR");
  cy.get(tid("bank-transfer.summary.recipient")).contains("Quintessence AG");
  cy.get(tid("bank-transfer.summary.iban")).contains("LI78088110102905K002E");
  cy.get(tid("bank-transfer.summary.bic")).contains("BFRILI22XXX");

  cy.get(tid("bank-transfer.summary.reference-number"))
    .then($e => $e.text().trim())
    .as("referenceNumber")
    .should("match", /NR[\w\d]{10}NR/);

  cy.get(tid("bank-transfer.summary.transfer-completed")).click();

  // TODO: Email are not send immediately after moving backend to use queues
  // cy.get<string>("@referenceNumber").then(assertWaitForBankTransferSummary);

  cy.get(tid("bank-transfer.verify.success.go-to-wallet")).click();

  assertWallet();
}

describe("Bank Verification", () => {
  beforeEach(() => {
    clearEmailServer();
  });

  it("should start new verification process from wallet #banking #p3", () => {
    loginFixtureAccount("INV_ETH_EUR_ICBM_M_HAS_KYC_DUP");
    goToWallet();

    cy.get(tid("locked-wallet.neur.bank-account.link-account")).click();

    assertBankTransferFlow({
      agreementApprovalRequired: false,
    });
  });

  it("should start new verification process from profile #banking #p2", () => {
    loginFixtureAccount("INV_ETH_EUR_ICBM_M_HAS_KYC_DUP");
    goToProfile();

    cy.get(tid("linked-bank-account-widget.link-different-account")).click();

    assertBankTransferFlow({
      agreementApprovalRequired: false,
    });
  });

  it("should disable all action buttons related to bank transfer when not verified #banking #p3", () => {
    createAndLoginNewUser({
      type: "investor",
    });
    // Disabled on profile
    goToProfile();
    cy.get(tid("linked-bank-account-widget.link-account")).should("be.disabled");

    // Disabled on wallet
    goToWallet();
    cy.get(tid("locked-wallet.neur.bank-account.link-account")).should("be.disabled");
  });

  it("should not allow to use neur in case user is from US, Alabama #banking #p3", () => {
    loginFixtureAccount("demoinvestor10");
    // assert on wallet

    goToWallet();

    cy.get(tid("wallet-balance.restricted-neur.balance-value")).should("exist");

    cy.get(tid("wallet-balance.neur.purchase-button")).should("be.disabled");
    cy.get(tid("wallet-balance.neur.redeem-button")).should("be.disabled");

    // assert on profile

    goToProfile();

    cy.get(tid("linked-bank-account-widget")).should("not.exist");
  });
});
