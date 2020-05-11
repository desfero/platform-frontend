import {
  assertDashboard,
  assertEmailChangeFlow,
  assertEmailPendingChange,
  assertVerifyEmailWidgetIsInNoEmailState,
  assertVerifyEmailWidgetIsInUnverifiedEmailState,
  assertVerifyEmailWidgetIsInVerfiedEmailState,
  confirmAccessModal,
  fillForm,
  generateRandomEmailAddress,
  goToProfile,
  goToUserAccountSettings,
  registerWithLightWallet,
  tid,
  verifyLatestUserEmailAccountSetup,
  verifyLatestUserEmailWithAPI,
} from "../../../utils/index";

describe("Verify Email Widget", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });
  it("should change user email after register #emailing #p3", () => {
    const firstEmail = generateRandomEmailAddress();
    const secondEmail = generateRandomEmailAddress();
    const password = "strongpassword";

    registerWithLightWallet(firstEmail, password);
    assertDashboard();

    goToUserAccountSettings();
    assertVerifyEmailWidgetIsInUnverifiedEmailState();

    cy.get(tid("verify-email-widget.change-email.button")).awaitedClick();
    assertVerifyEmailWidgetIsInNoEmailState();

    cy.get(tid("verify-email-widget-form-email-input")).type(secondEmail);
    cy.get(tid("verify-email-widget-form-submit")).awaitedClick();

    confirmAccessModal();
    verifyLatestUserEmailAccountSetup(secondEmail);
    assertDashboard();

    goToProfile();
    assertVerifyEmailWidgetIsInVerfiedEmailState();
    assertVerifyEmailWidgetIsInUnverifiedEmailState(true);
    assertVerifyEmailWidgetIsInNoEmailState(true);
  });

  it("should automatically update email after change #emailing #p3", () => {
    const email = generateRandomEmailAddress();
    const password = "strongpassword";

    registerWithLightWallet(email, password);
    assertDashboard();

    goToUserAccountSettings();
    assertVerifyEmailWidgetIsInUnverifiedEmailState();
    verifyLatestUserEmailWithAPI(email);
    assertVerifyEmailWidgetIsInVerfiedEmailState();
    assertEmailChangeFlow();

    const newEmail = generateRandomEmailAddress();
    fillForm({
      email: newEmail,
      "verify-email-widget-form-submit": { type: "submit" },
    });

    confirmAccessModal();
    assertEmailPendingChange(email, newEmail);
    verifyLatestUserEmailWithAPI(newEmail);
    assertVerifyEmailWidgetIsInVerfiedEmailState();
  });
});
