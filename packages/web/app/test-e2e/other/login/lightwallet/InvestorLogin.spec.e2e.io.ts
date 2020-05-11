import { appRoutes } from "../../../../components/appRoutes";
import { stubChallengeApiRequest } from "../../../utils/apiStubs";
import {
  assertDashboard,
  assertLogin,
  assertProfile,
  assertVerifyEmailWidgetIsInVerfiedEmailState,
  assertWaitForLatestEmailSentWithSalt,
  createAndLoginNewUser,
  generateRandomEmailAddress,
  getLatestVerifyUserEmailLink,
  getWalletMetaData,
  goToDashboard,
  goToProfile,
  lightWalletTypeRegistrationInfo,
  logoutViaAccountMenu,
  registerWithLightWallet,
  tid,
  tidStartsWith,
  verifyLatestUserEmailAccountSetup,
} from "../../../utils/index";

describe("Investor", () => {
  let email: string;
  let password: string;

  beforeEach(() => {
    cy.clearLocalStorage();

    email = generateRandomEmailAddress();
    password = "strongpassword";
  });

  it("should not register without accepting Terms of Use", () => {
    cy.visit(appRoutes.register);

    cy.get(tid("wallet-selector-register-email"))
      .type("{selectall}{backspace}")
      .type(email);
    cy.get(tid("wallet-selector-register-password")).type(password);
    cy.get(tid("wallet-selector-register-confirm-password")).type(password);

    cy.get(tid("wallet-selector-register-button")).should("be.disabled");
  });

  it("should register user with light-wallet and send email #login #p1", () => {
    registerWithLightWallet(email, password);

    assertWaitForLatestEmailSentWithSalt(email);
  });

  it("should show network error #login #p2", () => {
    cy.server();
    stubChallengeApiRequest({}, 400);
    cy.visit(appRoutes.register);
    lightWalletTypeRegistrationInfo(email, password);
    cy.get(tid("generic-modal-dismiss-button")).click();

    // Should be able to register again once we hit an error

    lightWalletTypeRegistrationInfo(email, password);
    cy.get(tid("generic-modal-dismiss-button")).click();
  });

  it("should return an error when registering with same email #login #p2", () => {
    // register once and then verify email account
    cy.visit("/register");
    lightWalletTypeRegistrationInfo(email, password);
    assertDashboard();
    verifyLatestUserEmailAccountSetup(email);
    logoutViaAccountMenu();
    cy.clearLocalStorage();

    // register again with the same email, this should show a warning
    cy.visit("/register");
    lightWalletTypeRegistrationInfo(email, password);
    cy.get(tid("email-error")).contains("Sorry. This email address is already in use");
    cy.get(tid("wallet-selector-register-button")).should("be.disabled");
  });

  it("should update login email on activation #login #p2", () => {
    const TEST_LINK =
      "https://localhost:9090/email-verify?code=b7fb21ea-b248-4bc3-8500-b3f2b8644c17&email=pavloblack%40hotmail.com&user_type=investor&wallet_type=light&wallet_subtype=unknown&salt=XzNJFpdkgjOxrUXPFD6NmzkUGGpUmuA5vjrt1xyMFd4%3D";

    createAndLoginNewUser({
      type: "investor",
      kyc: "business",
    }).then(() => {
      goToDashboard();

      const walletMetadata = getWalletMetaData();
      logoutViaAccountMenu();

      goToDashboard(false);

      const registerEmail = walletMetadata.email;
      cy.log("Email used for registering:", registerEmail);
      // Use activation link
      cy.visit(TEST_LINK);
      cy.get(tid("light-wallet-login-with-email-email-field")).then(activationEmailNode => {
        const activationEmail = activationEmailNode.text();
        expect(activationEmail).to.not.equal(registerEmail);
      });
    });
  });

  it("should kepp user logged in on invalid access code and silence toaster when verified #login #p3", () => {
    registerWithLightWallet(email, password);
    assertDashboard();

    getLatestVerifyUserEmailLink(email).then(activationLink => {
      logoutViaAccountMenu();

      // register another user
      const newEmail = generateRandomEmailAddress();
      registerWithLightWallet(newEmail, password);

      assertDashboard();

      // try to activate previous user when second one is logged in
      cy.visit(activationLink);

      // Asserts if error toast shows up
      // @SEE https://github.com/Neufund/platform-frontend/issues/2709
      cy.get(
        tidStartsWith("modules.auth.sagas.verify-user-email.toast.verification-failed"),
      ).should("exist");
      // user B looks goes to dashboard
      assertProfile();
      // activate user B
      getLatestVerifyUserEmailLink(newEmail).then(activationLinkB => {
        cy.visit(activationLinkB);
        assertDashboard();
        goToProfile();
        assertProfile();
        // email should be verified
        assertVerifyEmailWidgetIsInVerfiedEmailState();
        cy.get(tid("profile.verify-email-widget.verified-email")).contains(newEmail);
        logoutViaAccountMenu();
        // login via link
        cy.visit(activationLinkB);
        assertLogin();
        cy.get(tid("light-wallet-login-with-email-email-field")).contains(newEmail);
        cy.get(tid("light-wallet-login-with-email-password-field")).type(password);
        cy.get(tid("wallet-selector-nuewallet.login-button")).click();
        assertDashboard();
        cy.visit(activationLinkB);
        assertDashboard();
        cy.get(tidStartsWith("modules.auth.sagas.verify-user-email.toast.verification-failed"), {
          timeout: 2000,
        }).should("not.exist");
      });
    });
  });
});
