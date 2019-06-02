import { fillForm } from "../utils/forms";
import {
  acceptWallet,
  assertDashboard,
  assertEmailChangeAbort,
  assertEmailChangeFlow,
  assertEmailPendingChange,
  goToProfile,
  registerWithLightWallet,
  verifyLatestUserEmail,
} from "../utils/index";
import { tid } from "../utils/selectors";
import {
  createAndLoginNewUser,
  DEFAULT_PASSWORD,
  generateRandomEmailAddress,
} from "../utils/userHelpers";

describe("Change Email", function(): void {
  describe("Has verified email", () => {
    let email;
    beforeEach(() => {
      createAndLoginNewUser({ type: "investor", kyc: "individual" }).then(() => {
        cy.window().then(async window => {
          // TODO: move into a seperate util method
          const metaData = JSON.parse(await window.localStorage.getItem("NF_WALLET_METADATA"));
          email = metaData.email;
        });
      });
    });

    it("should not allow to change email if it's already used by different account", () => {
      const newEmail = generateRandomEmailAddress();
      cy.clearLocalStorage();

      registerWithLightWallet(newEmail, DEFAULT_PASSWORD);
      assertDashboard();
      verifyLatestUserEmail(newEmail);

      assertEmailChangeFlow();

      fillForm({
        email: email,
        "verify-email-widget-form-submit": { type: "submit" },
      });

      acceptWallet();

      // assert if error message has popped in
      cy.get(tid("profile-email-exists")).should("exist");
    });

    it("should not allow to change email to the same as verified", () => {
      goToProfile();
      assertEmailChangeFlow();

      fillForm({
        email: email,
        "verify-email-widget-form-submit": { type: "submit" },
      });

      // assert if error message is present and new email has not been set
      cy.get(tid("profile-email-change-verified-exists")).should("exist");
      cy.get(tid("profile.verify-email-widget.unverified-email")).should("not.exist");
    });

    it("should allow to change email", () => {
      goToProfile();
      assertEmailChangeFlow();

      const newEmail = generateRandomEmailAddress();
      fillForm({
        email: newEmail,
        "verify-email-widget-form-submit": { type: "submit" },
      });

      acceptWallet();

      // assert if new email is pending for verification

      assertEmailPendingChange(email, newEmail);
    });

    it("should allow to abort email change flow", () => {
      const newEmail = generateRandomEmailAddress();

      goToProfile();
      assertEmailChangeFlow();

      fillForm({
        email: newEmail,
        "verify-email-widget-form-submit": { type: "submit" },
      });

      acceptWallet();

      // assert if new email is pending for verification
      assertEmailPendingChange(email, newEmail);

      cy.get(tid("verify-email-widget.abort-change-email.button")).click();

      assertEmailChangeAbort(email);
    });
  });

  describe("Has unverified email", () => {
    it("should not allow to change email to the same as pending unverified", () => {
      // TODO: check this flaky test
      const email = generateRandomEmailAddress();

      registerWithLightWallet(email, DEFAULT_PASSWORD);
      assertDashboard();

      goToProfile();

      assertEmailChangeFlow();

      fillForm({
        email,
        "verify-email-widget-form-submit": { type: "submit" },
      });

      // assert if error message showed up
      cy.get(tid("profile-email-change-unverified-exists")).should("exist");
    });

    it.only("should not allow to change email if it's already used by different account", () => {
      let email: string;

      createAndLoginNewUser({ type: "investor", kyc: "individual" })
        .then(() => {
          cy.window().then(async window => {
            // TODO: move into a seperate util method
            const metaData = JSON.parse(await window.localStorage.getItem("NF_WALLET_METADATA"));
            email = metaData.email;
          });
        })
        .then(() => {
          const newEmail = generateRandomEmailAddress();
          cy.clearLocalStorage();

          registerWithLightWallet(newEmail, DEFAULT_PASSWORD);
          assertDashboard();

          goToProfile();

          assertEmailChangeFlow();

          fillForm({
            email: email,
            "verify-email-widget-form-submit": { type: "submit" },
          });

          acceptWallet();

          // assert if error message has popped in
          cy.get(tid("profile-email-exists")).should("exist");
        });
    });
  });
});