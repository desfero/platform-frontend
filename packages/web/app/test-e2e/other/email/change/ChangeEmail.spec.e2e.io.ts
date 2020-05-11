import { DEFAULT_PASSWORD } from "../../../utils/constants";
import { fillForm } from "../../../utils/forms";
import {
  assertEmailChangeAbort,
  assertEmailChangeFlow,
  assertEmailPendingChange,
  assertProfile,
  confirmAccessModal,
  createAndLoginNewUser,
  generateRandomEmailAddress,
  getLatestVerifyUserEmailLink,
  getWalletMetaData,
  goToProfile,
  lightWalletTypeLoginInfo,
  lightWalletTypePasswordAndLogin,
  logoutViaAccountMenu,
  registerWithLightWallet,
  tid,
  verifyLatestUserEmailAccountSetup,
} from "../../../utils/index";

describe("Change Email", function(): void {
  let email: string;
  beforeEach(() => {
    createAndLoginNewUser({ type: "investor", kyc: "individual" }).then(() => {
      const metaData = getWalletMetaData();
      email = metaData.email;
    });
  });

  it("should not allow to change email if it's already used by different account #emailing #p3", () => {
    const newEmail = generateRandomEmailAddress();
    cy.clearLocalStorage();

    registerWithLightWallet(newEmail, DEFAULT_PASSWORD);

    verifyLatestUserEmailAccountSetup(newEmail);
    goToProfile();
    assertEmailChangeFlow();

    fillForm({
      email: email,
      "verify-email-widget-form-submit": { type: "submit" },
    });

    confirmAccessModal();

    // assert if error message has popped in
    cy.get(tid("profile-email-exists")).should("exist");
  });

  it("should not allow to change email to the same as verified #changing #p3", () => {
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

  it("should allow to change email #emailing #p2 #flaky", () => {
    goToProfile();
    assertEmailChangeFlow();

    const newEmail = generateRandomEmailAddress();
    fillForm({
      email: newEmail,
      "verify-email-widget-form-submit": { type: "submit" },
    });

    confirmAccessModal();

    // assert if new email is pending for verification
    assertEmailPendingChange(email, newEmail);

    logoutViaAccountMenu();

    getLatestVerifyUserEmailLink(newEmail).then(activationLink => {
      cy.visit(activationLink);
      lightWalletTypeLoginInfo(newEmail, DEFAULT_PASSWORD);
      assertProfile();
    });
  });

  it("should allow to abort email change flow #emailing #p3", () => {
    const newEmail = generateRandomEmailAddress();

    goToProfile();
    assertEmailChangeFlow();

    fillForm({
      email: newEmail,
      "verify-email-widget-form-submit": { type: "submit" },
    });

    confirmAccessModal();

    // assert if new email is pending for verification
    assertEmailPendingChange(email, newEmail);

    cy.get(tid("verify-email-widget.abort-change-email.button")).click();

    assertEmailChangeAbort(email);
  });

  it("should not show unverified email reminder when after verifying email #emailing #p3", () => {
    goToProfile();
    assertEmailChangeFlow();

    const newEmail = generateRandomEmailAddress();
    fillForm({
      email: newEmail,
      "verify-email-widget-form-submit": { type: "submit" },
    });

    confirmAccessModal();

    // assert if new email is pending for verification
    assertEmailPendingChange(email, newEmail);

    logoutViaAccountMenu();

    getLatestVerifyUserEmailLink(newEmail).then(activationLink => {
      cy.visit(activationLink);
      lightWalletTypePasswordAndLogin(DEFAULT_PASSWORD);
      cy.get(tid("profile.verify-email-widget")).should("exist");
      cy.get(tid("unverified-email-reminder-modal")).should("not.exist");
    });
  });
});
