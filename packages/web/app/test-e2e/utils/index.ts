import {
  EAbbreviatedNumberOutputFormat,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  formatNumber,
  getRange,
  stripNumberFormatting,
  THumanReadableFormat,
  toFixedPrecision,
} from "@neufund/shared";
import BigNumber from "bignumber.js";
import { floor, get } from "lodash";

import { appRoutes } from "../../components/appRoutes";
import { MOCK_API_URL } from "../config";
import {
  assertDashboard,
  assertIssuerDashboard,
  assertLanding,
  assertWaitForExternalPendingTransactionCount,
  getLatestEmailByUser,
} from "./assertions";
import { goToLanding, goToWallet } from "./navigation";
import { tid } from "./selectors";
import { DEFAULT_PASSWORD, verifyUserEmailCall } from "./userHelpers";

export const LONG_WAIT_TIME = 60000;

export const numberRegExPattern = /\d+/g;

export const letterRegExPattern = /[^0-9]/gi;

export const letterKeepDotRegExPattern = /[^0-9.]/gi;

export const charRegExPattern = /[^a-z0-9]/gi;

export const clearEmailServer = () => {
  cy.request({ url: MOCK_API_URL + "sendgrid/session/mails", method: "DELETE" });
};

export const registerWithLightWalletETO = (
  email: string,
  password: string,
  acceptTos: boolean = true,
) => {
  cy.visit("eto/register/light");

  lightWalletTypeRegistrationInfo(email, password);
  if (acceptTos) acceptTOS();
};

export const registerWithLightWalletNominee = (
  email: string,
  password: string,
  acceptTos: boolean = true,
) => {
  cy.visit("nominee/register");

  lightWalletTypeRegistrationInfo(email, password);
  if (acceptTos) acceptTOS();
};

export const typeLightwalletRecoveryPhrase = (words: string[]) => {
  for (let batch = 0; batch < words.length / 4; batch++) {
    for (let index = 0; index < 4; index++) {
      cy.get(`${tid(`seed-recovery-word-${batch * 4 + index}`)} input`)
        .type(words[batch * 4 + index], { force: true, timeout: 20 })
        .type("{enter}", { force: true });
    }

    if (batch + 1 < words.length / 4) {
      cy.get(tid("btn-next")).awaitedClick();
    }
  }

  cy.get(tid("btn-send")).awaitedClick();
};

export const confirmAccessModal = (password: string = DEFAULT_PASSWORD) => {
  cy.get(tid("access-light-wallet-password-input")).type(password);
  cy.get(tid("access-light-wallet-confirm"))
    .should("be.enabled")
    .awaitedClick();
};

export const confirmAccessModalNoPW = () => {
  cy.get(tid("access-light-wallet-prompt-accept-button")).click();
};

export const closeModal = () => {
  cy.get(tid("modal-close-button")).awaitedClick();
};

export const getLatestVerifyUserEmailLink = (
  email: string,
  attempts = 5,
): Cypress.Chainable<string> =>
  cy
    .request({ url: MOCK_API_URL + `sendgrid/session/mails?to=${email}`, method: "GET" })
    .then(r => {
      const latestEmailByUser = getLatestEmailByUser(r, email);

      const activationLink = get(latestEmailByUser, "template_vars.activation_link");

      if (activationLink) {
        // we need to replace the loginlink pointing to a remote destination
        // with one pointing to our local instance
        return activationLink.replace("platform.neufund.io", "localhost:9090");
      } else {
        expect(attempts, `Failed to find activation link for email ${email}`).to.be.gt(0);

        cy.wait(1000);

        return getLatestVerifyUserEmailLink(email, attempts - 1);
      }
    });

export const verifyLatestUserEmail = (email: string) => {
  getLatestVerifyUserEmailLink(email).then(activationLink => {
    cy.visit(activationLink);
    cy.get(tid("email-verified"));
  });
};

export const verifyLatestUserEmailAccountSetup = (email: string) => {
  getLatestVerifyUserEmailLink(email).then(activationLink => {
    cy.visit(activationLink);
  });
};

export const verifyLatestUserEmailWithAPI = (email: string) => {
  getLatestVerifyUserEmailLink(email).then(verifyUserEmailCall);
};

export const registerWithLightWallet = (
  email: string,
  password: string,
  asIssuer: boolean = false,
) => {
  cy.visit(asIssuer ? appRoutes.registerIssuer : appRoutes.register);

  cy.get(tid("wallet-selector-light")).awaitedClick();
  lightWalletTypeRegistrationInfo(email, password);

  acceptTOS();

  if (asIssuer) {
    assertIssuerDashboard();
  } else {
    assertDashboard();
  }
};

export const ethereumProvider = (provider: any) =>
  cy.window().then(win => {
    (win as any).ethereum = provider;
  });

export const registerWithBrowserWalletAndLogin = (privateKeyProvider: any) => {
  goToLanding();

  ethereumProvider(privateKeyProvider);
  cy.get(tid("Header-login")).click();

  cy.get(tid("wallet-selector-browser")).click();

  cy.get(tid("signing.browser-wallet.sign-prompt")).should("exist");
  acceptTOS();
};

export const acceptTOS = () => {
  // need to force 'click' because of this cypress issue: https://github.com/cypress-io/cypress/issues/695
  cy.get(tid("modals.accept-tos.accept-button"))
    .should("be.enabled")
    .click({ force: true });

  cy.get(tid("modals.accept-tos")).should("not.exist");
};

export const lightWalletTypeRegistrationInfo = (email: string, password: string) => {
  cy.get(tid("wallet-selector-register-email")).type(email);
  cy.get(tid("wallet-selector-register-password")).type(password);
  cy.get(tid("wallet-selector-register-confirm-password")).type(password);

  cy.get(tid("wallet-selector-register-button"))
    .should("be.enabled")
    .awaitedClick()
    .should("be.disabled");
};

export const logoutViaAccountMenu = () => {
  cy.get(tid("account-menu-open-button"))
    .awaitedClick()
    .get(tid("menu-logout-button"))
    .awaitedClick();

  assertLanding();
};

export const goToUserAccountSettings = () => {
  cy.get(tid("account-menu-open-button"))
    .awaitedClick()
    .get(tid("authorized-layout-profile-button"))
    .awaitedClick();
};

export const lightWalletTypePasswordAndLogin = (password: string) => {
  cy.get(tid("light-wallet-login-with-email-password-field")).type(password);
  cy.get(tid("wallet-selector-nuewallet.login-button")).awaitedClick();
  cy.get(tid("wallet-selector-nuewallet.login-button")).should("be.disabled");
};

export const lightWalletTypeLoginInfo = (email: string, password: string) => {
  cy.contains(tid("light-wallet-login-with-email-email-field"), email);
  lightWalletTypePasswordAndLogin(password);
};

export const loginWithLightWallet = (email: string, password: string) => {
  cy.get(tid("Header-login")).awaitedClick();
  cy.get(tid("wallet-selector-light")).awaitedClick();

  lightWalletTypeLoginInfo(email, password);
};

export const stubWindow = (hookName: string) =>
  cy.window().then(win => {
    cy.stub(win, "open").as(hookName);
  });

export const stubAlert = (hookName: string) => cy.on("window:alert", cy.stub().as(hookName));

export const shouldDownloadDocument = (id: string, documentName: string) => {
  stubAlert("alert");

  cy.get(tid(id)).click();

  cy.get("@alert").should("be.calledWithMatch", new RegExp(`Filename: ${documentName}`));
};

/**
 * Extract amount from string.
 * @example
 * parseAmount("1 245 352 EUR") // return BigNumber(1245352)
 * parseAmount("$1 245 352") // return BigNumber(1245352)
 */
export const parseAmount = (amount: string) => new BigNumber(amount.replace(/\s|^\D+|\D+$/g, ""));

/**
 * Get eth wallet balance
 */
export const getWalletEthAmount = (navigateToWallet: boolean = true) => {
  if (navigateToWallet) {
    goToWallet();
  }

  return cy
    .get(tid("wallet-balance.ether.balance-values.large-value"))
    .then($element => parseAmount($element.text()));
};

/**
 * Get locked eth wallet balance
 */
export const getLockedWalletEthAmount = () => {
  goToWallet();

  return cy
    .get(tid("locked-wallet.eth.balance-values.large-value"))
    .then($element => parseAmount($element.text()));
};

/**
 * Get nEur wallet balance
 */
export const getWalletNEurAmount = (navigate: boolean = true) => {
  if (navigate) {
    goToWallet();
  }

  return cy
    .get(tid("wallet-balance.neur.balance-values.large-value"))
    .then($element => parseAmount(stripNumberFormatting($element.text())));
};

export const addPendingExternalTransaction = (address: string) => {
  cy.request({
    url: MOCK_API_URL + "parity/additional_addresses/",
    method: "PUT",
    body: [address],
  }).then(() => assertWaitForExternalPendingTransactionCount(1));
};

export const removePendingExternalTransaction = () => {
  // to clean external pending tx list send empty array
  cy.request({
    url: MOCK_API_URL + "parity/additional_addresses/",
    method: "PUT",
    body: [],
  }).then(() => assertWaitForExternalPendingTransactionCount(0));
};

export const getFormattedNumber = (
  value: string | undefined,
  roundingMode = ERoundingMode.UP,
  decimalPlaces = 4,
  inputFormat = ENumberInputFormat.FLOAT,
  outputFormat: THumanReadableFormat = ENumberOutputFormat.FULL,
  isPrice = false,
) =>
  value
    ? formatNumber({
        value,
        roundingMode,
        decimalPlaces,
        inputFormat,
        isPrice,
        outputFormat,
      })
    : "Unlimited";

export const getShortFormattedNumber = (
  value: string,
  roundingMode = ERoundingMode.UP,
  decimalPlaces = 4,
  outputFormat = EAbbreviatedNumberOutputFormat.LONG,
  inputFormat = ENumberInputFormat.FLOAT,
) => {
  const rangeKeys: { [key: number]: string } = {
    1000: "K",
    1000000: "M",
  };

  const number = parseFloat(
    toFixedPrecision({ value, roundingMode, inputFormat, decimalPlaces, outputFormat }),
  );
  const range = getRange(number);

  const shortVal = floor(number / range!.divider, 1).toString();

  const rangeIndicator = rangeKeys[range!.divider];

  return `${shortVal}${rangeIndicator}`;
};

export const getPercentage = (value: number) => `${value * 100}%`;

// Reexport assertions so they are easy accessed through utils
export * from "./assertions";
export * from "./selectors";
export * from "./navigation";
export * from "./userHelpers";
export * from "./forms";
export * from "./offlineHelpers";
export * from "./fixtures";
