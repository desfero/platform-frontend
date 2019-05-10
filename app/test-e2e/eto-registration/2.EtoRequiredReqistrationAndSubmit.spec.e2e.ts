import { assertEtoDashboard, assertEtoDocuments } from "../utils/assertions";
import { checkForm, fillForm, TFormFixture, uploadDocumentToFieldWithTid } from "../utils/forms";
import { goToEtoDashboard } from "../utils/navigation";
import { tid } from "../utils/selectors";
import { createAndLoginNewUser } from "../utils/userHelpers";
import { submitProposal } from "./EtoRegistrationUtils";
import {
  aboutFormRequired,
  aboutFormSubmit,
  equityTokenInfoForm,
  etoTermsRequiredForm,
  investmentTermsRequiredForm,
  legalInfoRequiredForm,
  mediaRequiredForm,
  votingRights,
} from "./fixtures";

const fillAndAssert = (section: string, sectionForm: TFormFixture) => {
  cy.get(tid(section, "button")).click();
  fillForm(sectionForm);
  assertEtoDashboard();
};

const openAndCheckValues = (section: string, sectionForm: TFormFixture) => {
  cy.get(tid(section, "button")).click();
  checkForm(sectionForm);
  goToEtoDashboard();
};

describe.skip("Eto Forms", () => {
  it("should fill required fields and submit eto", () => {
    createAndLoginNewUser({ type: "issuer", kyc: "business" }).then(() => {
      goToEtoDashboard();

      fillAndAssert("eto-progress-widget-about", {
        ...aboutFormRequired,
        ...aboutFormSubmit,
      });

      fillAndAssert("eto-progress-widget-legal-info", legalInfoRequiredForm);

      fillAndAssert("eto-progress-widget-investment-terms", investmentTermsRequiredForm);

      fillAndAssert("eto-progress-widget-eto-terms", etoTermsRequiredForm);

      fillAndAssert("eto-progress-widget-media", mediaRequiredForm);

      fillAndAssert("eto-progress-widget-equity-token-info", equityTokenInfoForm);

      fillAndAssert("eto-progress-widget-voting-right", votingRights);

      // some checks to make sure the values in already saved forms are displayed correctly
      openAndCheckValues("eto-progress-widget-investment-terms", investmentTermsRequiredForm);
      openAndCheckValues("eto-progress-widget-eto-terms", etoTermsRequiredForm);

      cy.get(tid("dashboard-upload-termsheet")).click();
      assertEtoDocuments();

      const documentsForm: TFormFixture = {
        "form.name.signed_termsheet": {
          value: "example.pdf",
          method: "document",
          type: "custom",
        },
      };

      fillForm(documentsForm, {
        submit: false,
        methods: { document: uploadDocumentToFieldWithTid },
      });

      submitProposal();
    });
  });
});
