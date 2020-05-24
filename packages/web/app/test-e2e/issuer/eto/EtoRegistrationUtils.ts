import { createUser } from "@neufund/shared-modules/tests";
import { toCamelCase, toSnakeCase, withParams } from "@neufund/shared-utils";
import { isFunction } from "lodash/fp";

import { etoRegisterRoutes } from "../../../components/eto/registration/routes";
import { TPartialCompanyEtoData } from "../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { confirmAccessModal } from "../../utils";
import { assertIssuerDashboard } from "../../utils/assertions";
import { cyPromise } from "../../utils/cyPromise";
import { checkForm, fillForm, TFormFixture, TFormFixtureExpectedValues } from "../../utils/forms";
import { goToIssuerDashboard } from "../../utils/navigation";
import { tid } from "../../utils/selectors";
import { makeAuthenticatedCall } from "../../utils/userHelpers";
import {
  aboutFormRequired,
  aboutFormSubmit,
  equityTokenInfoForm,
  legalInfoRequiredForm,
  mediaRequiredForm,
  productVisionRequiredForm,
} from "./fixtures";

export const submitProposal = () => {
  goToIssuerDashboard();

  cy.get(tid("eto-dashboard-submit-proposal")).click();
  confirmAccessModal();

  cy.get(tid("eto-state-pending")).should("exist");
};

export const submitPreview = () => {
  goToIssuerDashboard();

  cy.get(tid("eto-dashboard-publish-eto-widget.publish")).click();

  confirmAccessModal();

  cy.get(tid("eto-dashboard-publish-eto-widget")).should("not.exist");
};

export const goToSection = (section: string) => {
  cy.get(`${tid(section)} button`).click();
};

export const fillAndAssertFull = (section: string, sideEffect: TFormFixture | (() => void)) => {
  fillAndAssert(section, sideEffect);

  cy.get(`${tid(section)} ${tid("chart-circle.progress")}`).should("contain", "100%");
};

export const fillAndAssert = (section: string, sideEffect: TFormFixture | (() => void)) => {
  goToSection(section);

  if (isFunction(sideEffect)) {
    sideEffect();
  } else {
    fillForm(sideEffect);
  }

  assertIssuerDashboard();
};

/**
 * Creates new nominee and connects it's to issuer eto
 */
export const createAndSetNominee = () =>
  cyPromise(async () => {
    const [etoId, nominee] = await Promise.all([
      getIssuerEtoId(),
      createUser("nominee", undefined, "business"),
    ]);

    setEtoNominee(etoId, nominee.address);
  });

const ETO_ME_PATH = "/api/eto-listing/etos/me";

/**
 * Get current logged in issuer eto id
 */
export const getIssuerEtoId = (): Promise<string> =>
  makeAuthenticatedCall(ETO_ME_PATH)
    .then(toCamelCase)
    .then(response => response.etoId);

const COMPANIES_ME_PATH = "/api/eto-listing/companies/me";

/**
 * Send a patch request to issuer company
 */
export const putIssuerCompany = (company: TPartialCompanyEtoData): Promise<string> =>
  makeAuthenticatedCall(COMPANIES_ME_PATH, {
    method: "put",
    body: JSON.stringify(toSnakeCase(company)),
  }).then(toCamelCase);

const SET_ETO_NOMINEE_PATH =
  "/api/external-services-mock/e2e-tests/etos/:etoId/nominees/:nomineeId";

/**
 * Assigns nominee to eto programmatically
 * @param etoId
 * @param nomineeId
 */
const setEtoNominee = (etoId: string, nomineeId: string) => {
  const path = withParams(SET_ETO_NOMINEE_PATH, { etoId, nomineeId });

  return cy.request("PUT", path);
};

export const fillRequiredCompanyInformation = () => {
  goToIssuerDashboard();

  fillAndAssert("eto-progress-widget-about", {
    ...aboutFormRequired,
    ...aboutFormSubmit,
  });

  fillAndAssert("eto-progress-widget-legal-info", legalInfoRequiredForm);

  fillAndAssert("eto-progress-widget-media", mediaRequiredForm);

  fillAndAssert("eto-progress-widget-product-vision", productVisionRequiredForm);

  fillAndAssert("eto-progress-widget-equity-token-info", equityTokenInfoForm);

  fillAndAssert("eto-progress-widget-product-vision", productVisionRequiredForm);
};

export const acceptNominee = (address: string) => {
  goToSection("eto-progress-widget-voting-right");

  cy.get(tid("eto-nominee-accept")).click();

  confirmAccessModal();

  cy.get(tid(`chosen-nominee-${address}`)).should("exist");
};

export const cancelNominee = (address: string) => {
  cy.get(tid(`chosen-nominee-${address}`))
    .find(tid("delete-nominee-request"))
    .click();

  confirmAccessModal();

  cy.get(tid("no-pending-nominee-requests")).should("exist");
};

export const rejectNominee = () => {
  goToSection("eto-progress-widget-voting-right");

  cy.get(tid("eto-nominee-reject")).click();

  confirmAccessModal();

  cy.get(tid("no-pending-nominee-requests")).should("exist");
};

export const assertUploadSignedTermsheetStep = () => {
  // eto state should be still in preview
  cy.get(tid("eto-state-preview")).should("exist");
  // step should be moved to upload signed termsheet step
  cy.get(tid("eto-dashboard-upload-signed-termsheet")).should("exist");

  cy.get(tid("dashboard-upload-termsheet-widget")).should("exist");
};

export const assertPublishListingPage = () => {
  cy.get(tid("eto-state-preview")).should("exist");
  cy.get(tid("eto-dashboard-publish-listing")).should("exist");

  cy.get(tid("eto-dashboard-publish-eto-widget")).should("exist");
};

export const assertLinkNomineeStep = () => {
  cy.get(tid("eto-state-preview")).should("exist");
  cy.get(tid("eto-dashboard-link-nominee")).should("exist");

  // termsheet widget should not be longer available
  cy.get(tid("dashboard-upload-termsheet-widget")).should("not.exist");
};

export const assertWaitForNomineeAgreementsStep = () => {
  cy.get(tid("eto-state-whitelisting")).should("exist");
  cy.get(tid("eto-dashboard-waiting-for-nominee-agreements")).should("exist");

  // start date widget should not exist until agreements are signed by nomiee
  cy.get(tid("eto-settings-set-start-date")).should("not.exist");
};

export const assertSetEtoStartDateStep = () => {
  cy.get(tid("eto-state-whitelisting")).should("exist");
  cy.get(tid("eto-dashboard-set-start-date")).should("exist");

  cy.get(tid("eto-settings-set-start-date")).should("exist");
  cy.get(tid("eto-settings-start-date-open-date-picker")).should("exist");
};

export const assertLinkNomineeStepAwaitingRequestState = (issuerAddress: string) => {
  assertLinkNomineeStep();

  cy.get(tid("issuer-id")).should("have.text", issuerAddress);
};

export const assertLinkNomineeStepAwaitingApprovalState = () => {
  assertLinkNomineeStep();

  cy.get(tid("eto-dashboard-accept-nominee")).should("exist");
};

export const assertFillEtoInformationState = () => {
  cy.get(tid("eto-state-preview")).should("exist");
  cy.get(tid("eto-dashboard-fill-information-about-eto")).should("exist");
};

export const assertUploadMemorandumDocumentStep = () => {
  cy.get(tid("eto-state-campaigning")).should("exist");
  cy.get(tid("eto-dashboard-upload-memorandum-document")).should("exist");

  cy.get(tid("dashboard-upload-investment-memorandum-widget")).should("exist");
};

export const assertUploadISHAStep = () => {
  cy.get(tid("eto-state-campaigning")).should("exist");
  cy.get(tid("eto-dashboard-upload-isha")).should("exist");

  // memorandum widget should not be longer available
  cy.get(tid("dashboard-upload-investment-memorandum-widget")).should("not.exist");

  cy.get(tid("dashboard-upload-isha-widget")).should("exist");
};

export const assertUploadSignedISHAStep = () => {
  cy.get(tid("eto-state-3")).should("exist");
  cy.get(tid("eto-dashboard-sign-your-isha")).should("exist");

  cy.get(tid("dashboard-upload-signed-isha-widget")).should("exist");

  // Sign ISHA should not exist yet
  cy.get(tid("dashboard-sign-isha-on-chain-widget")).should("not.exist");
};

export const assertSignISHAStep = () => {
  cy.get(tid("eto-state-3")).should("exist");
  cy.get(tid("eto-dashboard-sign-your-isha")).should("exist");

  cy.get(tid("dashboard-sign-isha-on-chain-widget")).should("exist");

  // Upload signed ISHA widget should not exist anymore
  cy.get(tid("dashboard-upload-signed-isha-widget")).should("not.exist");
};

export const assertWaitForNomineeToSignISHAStep = () => {
  cy.get(tid("eto-state-3")).should("exist");
  cy.get(tid("eto-dashboard-sign-your-isha")).should("exist");

  cy.get(tid("dashboard-wait-for-nominee-to-sign-isha-widget")).should("exist");

  // Sign ISHA widget should not exist anymore
  cy.get(tid("dashboard-sign-isha-on-chain-widget")).should("not.exist");
};

export const assertWaitingForSmartContractsStep = () => {
  cy.get(tid("eto-state-campaigning")).should("exist");
  cy.get(tid("eto-dashboard-waiting-for-smart-contracts")).should("exist");

  // isha upload should not be longer available
  cy.get(tid("dashboard-upload-isha-widget")).should("not.exist");
};

export const assertPresaleStep = () => {
  cy.get(tid("eto-state-countdown_to_public_sale")).should("exist");
  cy.get(tid("eto-dashboard-fundraising-live")).should("exist");
};

export const assertPublicStep = () => {
  cy.get(tid("eto-state-2")).should("exist");
  cy.get(tid("eto-dashboard-fundraising-live")).should("exist");
};

export const openAndCheckValues = (
  section: string,
  sectionForm: TFormFixture,
  expectedValues: TFormFixtureExpectedValues,
) => {
  goToIssuerDashboard();

  goToSection(section);

  checkForm(sectionForm, expectedValues);
};

export const goToCompanyInformation = () => {
  cy.visit(etoRegisterRoutes.companyInformation);
  cy.get(tid("eto.form.company-information")).should("exist");
};

export const goToLegalInformation = () => {
  cy.visit(etoRegisterRoutes.legalInformation);
  cy.get(tid("eto.form.legal-information")).should("exist");
};
