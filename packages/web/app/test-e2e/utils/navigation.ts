import { IWindowData, IWindowWithData } from "../../../test/helperTypes";
import { assertIssuerEtoView } from "../issuer/eto/view/EtoViewUtils";
import {
  assertDashboard,
  assertEtoDocuments,
  assertIssuerDashboard,
  assertLanding,
  assertNomineeDashboard,
  assertPortfolio,
  assertProfile,
  assertWallet,
} from "./assertions";

export const goToDashboard = (assert = true) => {
  cy.visit("/dashboard");

  if (assert) {
    assertDashboard();
  }
};

export const goToLanding = (assert = true) => {
  cy.visit("/");

  if (assert) {
    assertLanding();
  }
};

export const goToDashboardWithRequiredPayoutAmountSet = (
  assert = true,
  requiredPayoutAmount?: string,
) => {
  cy.visit("/dashboard", {
    onBeforeLoad(win: IWindowWithData): void {
      win.payoutRequiredAmount = requiredPayoutAmount;
    },
  });

  if (assert) {
    assertDashboard();
  }
};

export const goToWalletWithParams = (params: IWindowData = {}) => {
  cy.visit("/wallet", {
    onBeforeLoad(win: IWindowWithData): void {
      for (let [key, value] of Object.entries(params)) {
        win[key as any] = value;
      }
    },
  });
};

export const goToIssuerDashboard = () => {
  cy.visit("/dashboard");
  assertIssuerDashboard();
};

export const goToEtoPreview = () => {
  cy.visit("/eto/view");
  assertIssuerEtoView();
};

export const goToNomineeDashboard = (forcedActiveEtoPreviewCode?: string) => {
  cy.visit(`/dashboard${forcedActiveEtoPreviewCode ? `?eto=${forcedActiveEtoPreviewCode}` : ""}`);

  assertNomineeDashboard();
};

export const goToProfile = () => {
  cy.visit("/profile");
  assertProfile();
};

export const goToPortfolio = () => {
  cy.visit("/portfolio");
  assertPortfolio();
};

export const goToWallet = () => {
  cy.visit("/wallet");
  assertWallet();
};

export const goToEtoDocuments = () => {
  cy.visit("/documents");
  assertEtoDocuments();
};

export const goToPortfolioWithRequiredPayoutAmountSet = (requiredPayoutAmount?: string) => {
  cy.visit("/portfolio", {
    onBeforeLoad(win: IWindowWithData): void {
      win.payoutRequiredAmount = requiredPayoutAmount;
    },
  });
  assertPortfolio();
};

export const goToLoginLightWallet = () => {
  cy.visit("/login/light");
};

export const goToLoginWithMockedWeb3 = () => {
  cy.visit("/login", {
    onBeforeLoad(win: IWindowWithData): void {
      win.ethereum = {};
    },
  });
};

export const goToLoginLightWalletWithMockedWeb3 = () => {
  cy.visit("/login/light", {
    onBeforeLoad(win: IWindowWithData): void {
      win.ethereum = {};
    },
  });
};

export const goToRegisterWithMockedWeb3 = () => {
  cy.visit("/register", {
    onBeforeLoad(win: IWindowWithData): void {
      win.ethereum = {};
    },
  });
};

export const goToRegisterLightWalletWithMockedWeb3 = () => {
  cy.visit("/register/light", {
    onBeforeLoad(win: IWindowWithData): void {
      win.ethereum = {};
    },
  });
};
