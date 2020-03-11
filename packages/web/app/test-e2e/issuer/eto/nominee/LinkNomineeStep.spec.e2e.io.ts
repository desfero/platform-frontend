import { linkEtoToNominee } from "../../../nominee/NomineeFlowUtils";
import { logoutViaAccountMenu } from "../../../utils/index";
import { goToIssuerDashboard, goToNomineeDashboard } from "../../../utils/navigation";
import { tid } from "../../../utils/selectors";
import { createAndLoginNewUser } from "../../../utils/userHelpers";
import {
  acceptNominee,
  assertLinkNomineeStep,
  assertLinkNomineeStepAwaitingApprovalState,
  assertLinkNomineeStepAwaitingRequestState,
  assertUploadSignedTermsheetStep,
  cancelNominee,
  rejectNominee,
} from "../EtoRegistrationUtils";
import { pushEtoDataToAPI, pushEtoToAPI } from "../utils";
import { goToIssuerEtoView } from "../view/EtoViewUtils";

const fillEtoToLinkNomineeStep = (issuerAddress: string) => {
  pushEtoToAPI();
  pushEtoDataToAPI();
  goToIssuerDashboard();
  // should move to link nominee
  assertLinkNomineeStepAwaitingRequestState(issuerAddress);
};

describe("Eto Forms link nominee", () => {
  it(
    "should move from Publish Listing Page to Link nominee step " +
      "after filling required fields from Eto Terms and Investment Terms forms " +
      "and then go through nominee linking process on both issuer and nominee side " +
      "#eto #nominee #p2",
    () => {
      createAndLoginNewUser({ type: "issuer", kyc: "business" }).then(
        ({ address: issuerAddress }) => {
          cy.saveLocalStorage(issuerAddress);

          fillEtoToLinkNomineeStep(issuerAddress);
          logoutViaAccountMenu();
          cy.log("-----nominee-----");
          createAndLoginNewUser({ type: "nominee", kyc: "business" }).then(
            ({ address: nomineeAddress }) => {
              cy.saveLocalStorage(nomineeAddress);

              linkEtoToNominee(issuerAddress);

              // get back issuer
              cy.log("-----issuer-----");
              cy.restoreLocalStorage(issuerAddress);

              // should await nominee acceptation on dashboard
              goToIssuerDashboard();
              assertLinkNomineeStepAwaitingApprovalState();

              acceptNominee(nomineeAddress);

              // should move to setup eto state after nominee was accepted
              goToIssuerDashboard();

              assertUploadSignedTermsheetStep();

              // get back to nominee
              cy.log("-----nominee-----");
              cy.restoreLocalStorage(nomineeAddress);

              // should have eto linked
              goToIssuerEtoView();
            },
          );
        },
      );
    },
  );

  it(
    "should move from Publish Listing Page to Link nominee step " +
      "after filling required fields from Eto Terms and Investment Terms forms " +
      "and then nominee request approval and issuer rejects it #eto #nominee #p3",
    () => {
      createAndLoginNewUser({ type: "issuer", kyc: "business" }).then(
        ({ address: issuerAddress }) => {
          cy.log("-----issuer-----");
          cy.saveLocalStorage(issuerAddress);

          fillEtoToLinkNomineeStep(issuerAddress);
          logoutViaAccountMenu();

          cy.log("-----nominee-----");
          createAndLoginNewUser({ type: "nominee", kyc: "business" }).then(
            ({ address: nomineeAddress }) => {
              cy.saveLocalStorage(nomineeAddress);

              linkEtoToNominee(issuerAddress);
              logoutViaAccountMenu();

              // get back issuer
              cy.log("-----issuer-----");
              cy.restoreLocalStorage(issuerAddress);

              // should await nominee acceptation on dashboard
              goToIssuerDashboard();
              assertLinkNomineeStepAwaitingApprovalState();

              rejectNominee();

              // should move back to link nominee step
              goToIssuerDashboard();
              assertLinkNomineeStepAwaitingRequestState(issuerAddress);
              logoutViaAccountMenu();

              // get back to nominee
              cy.log("-----nominee-----");
              cy.restoreLocalStorage(nomineeAddress);

              // should show rejected request information
              goToNomineeDashboard();
              cy.get(tid(`nominee-dashboard-request-rejected-${issuerAddress}`));
            },
          );
        },
      );
    },
  );

  it.only(
    "should move from Publish Listing Page to Link nominee step " +
      "after filling required fields from Eto Terms and Investment Terms forms " +
      "and then nominee request approval and issuer approves but later cancels it #eto #nominee #p3",
    () => {
      createAndLoginNewUser({ type: "issuer", kyc: "business" }).then(
        ({ address: issuerAddress }) => {
          cy.saveLocalStorage(issuerAddress);

          fillEtoToLinkNomineeStep(issuerAddress);
          logoutViaAccountMenu();

          createAndLoginNewUser({ type: "nominee", kyc: "business" }).then(
            ({ address: nomineeAddress }) => {
              cy.saveLocalStorage(nomineeAddress);

              linkEtoToNominee(issuerAddress);
              logoutViaAccountMenu();

              // get back issuer
              cy.restoreLocalStorage(issuerAddress);

              // should await nominee acceptation on dashboard
              goToIssuerDashboard();
              cy.get(tid("eto-dashboard-accept-nominee")).should("exist");

              acceptNominee(nomineeAddress);

              cancelNominee(nomineeAddress);

              // should move back to link nominee step
              goToIssuerDashboard();
              assertLinkNomineeStep();
              logoutViaAccountMenu();

              // get back to nominee
              cy.restoreLocalStorage(nomineeAddress);

              // should show rejected request information
              goToNomineeDashboard();
              cy.get(tid(`nominee-dashboard-request-rejected-${issuerAddress}`));
            },
          );
        },
      );
    },
  );
});
