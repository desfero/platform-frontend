import {
  acceptTOS,
  assertButtonIsActive,
  assertDashboard,
  assertErrorModal,
  assertVerifyEmailWidgetIsInVerfiedEmailState,
  assertWaitForLatestEmailSentWithSalt,
  createAndLoginNewUser,
  fillForm,
  generateRandomEmailAddress,
  getLatestVerifyUserEmailLink,
  goToDashboard,
  goToProfile,
  lightWalletTypeRegistrationInfo,
  loginWithLightWallet,
  logoutViaAccountMenu,
  registerWithLightWallet,
  tid,
  verifyLatestUserEmailAccountSetup,
} from "../../../utils/index";

describe("Investor", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("should register user with light-wallet and send email @login @p1", () => {
    const email = generateRandomEmailAddress();
    const password = "strongpassword";

    registerWithLightWallet(email, password);

    assertWaitForLatestEmailSentWithSalt(email);
  });

  it("should remember light wallet details after logout @login @p2", () => {
    const email = generateRandomEmailAddress();
    const password = "strongpassword";

    registerWithLightWallet(email, password);

    logoutViaAccountMenu();

    loginWithLightWallet(email, password);

    assertDashboard();
  });

  it("should recognize ETO user and save metadata correctly @login @p2", () => {
    const email = generateRandomEmailAddress();
    const password = "strongpassword";

    // todo: we should let to register as issuer here so mock is not needed
    registerWithLightWallet(email, password);

    logoutViaAccountMenu();

    loginWithLightWallet(email, password);

    assertDashboard().then(() => {
      const savedMetadata = (window.localStorage as any).NF_WALLET_METADATA;
      cy.clearLocalStorage().then(() => {
        // mock issuer metadata
        const mockedMetadata = JSON.parse(savedMetadata);
        mockedMetadata.userType = "issuer";
        (window.localStorage as any).NF_WALLET_METADATA = JSON.stringify(mockedMetadata);

        cy.visit("eto/login/light");
        // investor metadata woud be cleared here
        cy.contains(tid("light-wallet-login-with-email-email-field"), email);
        cy.get(tid("light-wallet-login-with-email-password-field")).type(password);
        cy.get(tid("wallet-selector-nuewallet.login-button")).awaitedClick();

        assertDashboard().then(() => {
          //after login investor metadata are again saved into local storage
          expect((window.localStorage as any).NF_WALLET_METADATA).to.be.deep.eq(savedMetadata);
        });
      });
    });
  });

  it("should wipe out saved investor wallet when issuer login @login @p3", () => {
    const email = generateRandomEmailAddress();
    const password = "strongpassword";

    // todo: we should let to register as issuer here so mock is not needed
    registerWithLightWallet(email, password);

    logoutViaAccountMenu();

    loginWithLightWallet(email, password);

    assertDashboard().then(() => {
      cy.clearLocalStorage().then(() => {
        cy.visit("eto/login/light");
        // investor metadata woud be cleared here
        expect((window.localStorage as any).NF_WALLET_METADATA).to.not.exist;
      });
    });
  });

  it("should return an error when logging with same email @login @p3", () => {
    const email = generateRandomEmailAddress();
    const password = "strongpassword";

    // register once and then verify email account
    cy.visit("/register");
    lightWalletTypeRegistrationInfo(email, password);
    assertDashboard();
    acceptTOS();
    verifyLatestUserEmailAccountSetup(email);
    logoutViaAccountMenu();
    cy.clearLocalStorage();

    // register again with the same email, this should show a warning
    cy.visit("/register");
    lightWalletTypeRegistrationInfo(email, password);
    assertErrorModal();

    //dismiss warning, register button must be enabled
    cy.get(tid("generic-modal-dismiss-button")).awaitedClick();
    assertButtonIsActive("wallet-selector-register-button");
  });

  it("should update login email on activation @login @p2", () => {
    const TEST_LINK =
      "https://localhost:9090/email-verify?code=b7fb21ea-b248-4bc3-8500-b3f2b8644c17&email=pavloblack%40hotmail.com&user_type=investor&wallet_type=light&wallet_subtype=unknown&salt=XzNJFpdkgjOxrUXPFD6NmzkUGGpUmuA5vjrt1xyMFd4%3D";

    createAndLoginNewUser({
      type: "investor",
      kyc: "business",
    }).then(() => {
      goToDashboard();

      logoutViaAccountMenu();

      goToDashboard(false);

      cy.get(tid("light-wallet-login-with-email-email-field")).then(registerEmailNode => {
        const registerEmail = registerEmailNode.text();
        cy.log("Email used for registering:", registerEmail);
        // Use activation link
        cy.visit(TEST_LINK);
        cy.get(tid("light-wallet-login-with-email-email-field")).then(activationEmailNode => {
          const activationEmail = activationEmailNode.text();
          expect(activationEmail).to.not.equal(registerEmail);
        });
      });
    });
  });

  it("should logout previous user when email activation occurs @login @p3", () => {
    const email = generateRandomEmailAddress();
    const password = "strongpassword";

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
      cy.get(tid("modules.auth.sagas.verify-user-email.toast.verification-failed")).should("exist");

      cy.get(tid("light-wallet-login-with-email-email-field")).contains(email);

      fillForm({
        password,
        "wallet-selector-nuewallet.login-button": {
          type: "submit",
        },
      });

      assertDashboard();
      goToProfile();
      // email should be verified
      assertVerifyEmailWidgetIsInVerfiedEmailState();
      cy.get(tid("profile.verify-email-widget.verified-email")).contains(email);
    });
  });
});