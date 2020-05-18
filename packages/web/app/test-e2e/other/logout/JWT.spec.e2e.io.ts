import { getJwtExpiryDate } from "@neufund/shared-utils";

import {
  AUTH_INACTIVITY_THRESHOLD,
  AUTH_JWT_TIMING_THRESHOLD,
  AUTH_TOKEN_REFRESH_THRESHOLD,
} from "../../../modules/auth/constants";
import { assertDashboard, assertLogin } from "../../utils/assertions";
import { cyPromise } from "../../utils/cyPromise";
import { fillForm } from "../../utils/forms";
import {
  assertEmailChangeFlow,
  assertLanding,
  assertUserInLightWalletLoginPage,
  confirmAccessModal,
  goToDashboard,
  goToProfile,
  tid,
} from "../../utils/index";
import {
  createAndLoginNewUser,
  generateRandomEmailAddress,
  getJwtToken,
  loginFixtureAccount,
} from "../../utils/userHelpers";
import { keepSessionActive, routeJwtCreate, routeJwtRefresh } from "../utils";

describe("JWT Refreshing and Escalation", () => {
  it("should logout to landing when token is initially expired #login #logout #jwt #p3", () => {
    createAndLoginNewUser({ type: "investor" }).then(() => {
      const jwtToken = getJwtToken();

      const jwtExpiryDate = getJwtExpiryDate(jwtToken).valueOf();
      const expectedTokenRefreshTime = jwtExpiryDate - AUTH_TOKEN_REFRESH_THRESHOLD;

      // add one seconds to get to the point after token should not be refreshed
      cy.clock(expectedTokenRefreshTime + 1, ["Date"]);

      goToDashboard(false);

      assertLanding();

      // Should remove jwt token from localstorage
      cy.wrap(null).should(() => {
        expect(getJwtToken()).to.equal(null);
      });
    });
  });

  it("should logout with session timeout message when token is already expired #login #logout #jwt #p3", () => {
    createAndLoginNewUser({ type: "investor" }).then(() => {
      goToDashboard();

      const now = Date.now();

      cy.clock(now, ["Date"]);

      const jwtExpiryDate = getJwtExpiryDate(getJwtToken());

      const diff = jwtExpiryDate.getTime() - now;
      const expectedTokenRefreshTimeFromNow = diff - AUTH_TOKEN_REFRESH_THRESHOLD;

      // add one second to simulate inactivity (for e.g. hibernation)
      // TODO: Check why the linter assumes the constants down are of type any
      cy.tick(expectedTokenRefreshTimeFromNow + AUTH_JWT_TIMING_THRESHOLD + 1000);

      assertUserInLightWalletLoginPage();

      cy.get(tid("wallet-selector-session-timeout-notification")).should("exist");
    });
  });

  describe("jwt refresh", () => {
    beforeEach(() => {
      cy.server();
    });

    it("should refresh jwt token #login #logout #jwt #p3", () => {
      createAndLoginNewUser({ type: "investor" }).then(() => {
        goToDashboard();

        const now = Date.now();

        cy.clock(now, ["Date"]);

        const jwtToken = getJwtToken();

        const jwtExpiryDate = getJwtExpiryDate(jwtToken);

        const diff = jwtExpiryDate.getTime() - now;

        const expectedTokenRefreshTimeFromNow = diff - AUTH_TOKEN_REFRESH_THRESHOLD;

        keepSessionActive(expectedTokenRefreshTimeFromNow);

        routeJwtRefresh().as("jwtRefresh");

        cy.tick(1);

        cy.wait("@jwtRefresh");

        cy.requestsCount("@jwtRefresh").should("equal", 1);

        // Should refresh jwt token in localstorage
        cy.wrap(jwtToken).should(token => {
          expect(token).to.not.equal(getJwtToken());
        });
      });
    });

    it("should not refresh jwt token after logging out due to inactivity #login #logout #jwt #p3", () => {
      createAndLoginNewUser({ type: "investor" }).then(() => {
        goToDashboard();

        const jwtToken = getJwtToken();

        const jwtExpiryDate = getJwtExpiryDate(jwtToken);

        let now = Date.now();

        // simulate inactivity logout
        cy.clock(now);

        cy.tick(AUTH_INACTIVITY_THRESHOLD / 2);
        now += AUTH_INACTIVITY_THRESHOLD / 2;

        assertDashboard();

        cy.tick(AUTH_INACTIVITY_THRESHOLD);
        now += AUTH_INACTIVITY_THRESHOLD;

        assertLogin();

        routeJwtRefresh().as("jwtRefresh");

        const diff = jwtExpiryDate.getTime() - now;

        const expectedTokenRefreshTimeFromNow = diff - AUTH_TOKEN_REFRESH_THRESHOLD;

        cy.tick(expectedTokenRefreshTimeFromNow + 1);

        // should not try to refresh jwt token after inactivity logout
        cy.requestsCount("@jwtRefresh").should("equal", 0);
      });
    });

    it("should refresh jwt token after logging out due to inactivity and logged in again #login #logout #jwt #p3", () => {
      const fixture = "INV_HAS_EUR_HAS_KYC";

      loginFixtureAccount(fixture).then(() => {
        goToDashboard();

        const now = Date.now();

        cy.clock(now).then(clock => {
          clock.tick(AUTH_INACTIVITY_THRESHOLD / 2);

          assertDashboard();

          clock.tick(AUTH_INACTIVITY_THRESHOLD);

          assertLogin();

          // restore the clock to unblock next attempt to login
          // wrap with promise so it wait's for previous commands to finish
          cyPromise(() => Promise.resolve(clock.restore()));
        });
      });

      loginFixtureAccount(fixture).then(() => {
        goToDashboard();

        const now = Date.now();

        cy.clock(now, ["Date"]);

        const jwtToken = getJwtToken();
        const jwtExpiryDate = getJwtExpiryDate(jwtToken);
        const diff = jwtExpiryDate.getTime() - now;
        const expectedTokenRefreshTimeFromNow = diff - AUTH_TOKEN_REFRESH_THRESHOLD;

        keepSessionActive(expectedTokenRefreshTimeFromNow);

        routeJwtRefresh().as("jwtRefresh");

        cy.tick(1);

        cy.wait("@jwtRefresh");
        cy.requestsCount("@jwtRefresh").should("equal", 1);

        // Should refresh jwt token in localstorage
        cy.wrap(jwtToken).should(token => {
          expect(token).to.not.equal(getJwtToken());
        });
      });
    });

    it("should escalate jwt token with new permissions #login #logout #jwt #p3", () => {
      routeJwtCreate().as("jwtEscalate");

      createAndLoginNewUser({ type: "investor" }).then(() => {
        goToProfile();

        assertEmailChangeFlow();

        const jwtToken = getJwtToken();

        fillForm({
          email: generateRandomEmailAddress(),
          "verify-email-widget-form-submit": { type: "submit" },
        });

        confirmAccessModal();

        // Should send current jwt during escalation to preserve existing permissions
        cy.wait("@jwtEscalate").should((xhr: Cypress.WaitXHR) => {
          expect(xhr.request.headers.authorization).to.equal(`Bearer ${jwtToken}`);
        });

        // Should refresh jwt localstorage
        cy.wrap(jwtToken).should(token => {
          expect(token).to.not.equal(getJwtToken());
        });
      });
    });
  });
});
