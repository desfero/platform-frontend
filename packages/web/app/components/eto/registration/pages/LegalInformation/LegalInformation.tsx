import { Button, EButtonLayout } from "@neufund/design-system";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { EtoLegalInformationType } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { ArrayOfKeyValueFields } from "../../../../shared/forms/fields/FormCategoryDistribution";
import {
  FormField,
  FormFieldDate,
  FormFieldError,
  FormFieldLabel,
  FormHighlightGroup,
  FormMaskedNumberInput,
  FormSelectField,
  FormTextArea,
} from "../../../../shared/forms/index";
import { FUNDING_ROUNDS } from "../../../shared/constants";
import { EtoFormBase } from "../../EtoFormBase";
import { Section } from "../../Shared";
import { connectEtoRegistrationLegalInformation, TComponentProps } from "./connectLegalInformation";

import * as styles from "../../Shared.module.scss";

const NUMBER_OF_EMPLOYEES = {
  NONE_KEY: <FormattedMessage id="form.select.please-select" />,
  "1-9": "1-9",
  "10-99": "10-99",
  "100-999": "100-999",
  ">1000": ">1000",
};

// Some fields in LegalInformation are always readonly because data are set during KYC process
const EtoRegistrationLegalInformationComponent: React.FunctionComponent<TComponentProps> = ({
  savingData,
  initialValues,
  saveData,
  validationFn,
}) => (
  <EtoFormBase
    data-test-id="eto.form.legal-information"
    title="Legal Information"
    validationSchema={EtoLegalInformationType.toYup()}
    validate={validationFn}
    initialValues={initialValues}
    onSubmit={saveData}
  >
    <Section>
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.legal-company-name" />}
        name="name"
        disabled={true}
      />
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.legal-form" />}
        name="legalForm"
        disabled={true}
      />
      <FormTextArea
        label={<FormattedMessage id="eto.form.legal-information.company-legal-description" />}
        name="companyLegalDescription"
        placeholder="Please enter the legal purpose of the entity stated in your incorporation documents."
      />
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.company-state-address" />}
        name="street"
        disabled={true}
      />
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.city-country" />}
        name="country"
        disabled={true}
      />
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.registration-number" />}
        name="registrationNumber"
        disabled={true}
      />
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.vat-number" />}
        name="vatNumber"
      />
      <FormFieldDate
        label={<FormattedMessage id="eto.form.legal-information.company-founding-date" />}
        name="foundingDate"
      />
      <FormSelectField
        label={<FormattedMessage id="eto.form.legal-information.number-of-employees" />}
        values={NUMBER_OF_EMPLOYEES}
        name="numberOfEmployees"
      />
      <FormMaskedNumberInput
        name="numberOfFounders"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.INTEGER}
        label={<FormattedMessage id="eto.form.legal-information.number-of-founders" />}
      />
      <FormSelectField
        label={<FormattedMessage id="eto.form.legal-information.last-funding-round" />}
        values={FUNDING_ROUNDS}
        name="companyStage"
      />
      <FormMaskedNumberInput
        name="lastFundingSizeEur"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.FULL}
        valueType={ECurrency.EUR}
        showUnits={true}
        label={<FormattedMessage id="eto.form.legal-information.last-funding-amount" />}
      />
      <FormMaskedNumberInput
        name="companyShareCapital"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.INTEGER}
        valueType={undefined}
        label={<FormattedMessage id="eto.form.legal-information.amount-of-share-capital" />}
      />
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.share-capital-currency-code" />}
        name="shareCapitalCurrencyCode"
      />
      <FormHighlightGroup>
        <FormFieldLabel name="shareholders">
          <FormattedMessage id="eto.form.legal-information.shareholder-structure" />
        </FormFieldLabel>
        <ArrayOfKeyValueFields
          name="shareholders"
          valuePlaceholder={"Share capital"}
          suggestions={["Full Name"]}
          fieldNames={["fullName", "shareCapital"]}
        />
        <FormFieldError name={"shareholders"} />
      </FormHighlightGroup>
    </Section>
    <Section className={styles.buttonSection}>
      <Button
        type="submit"
        layout={EButtonLayout.OUTLINE}
        isLoading={savingData}
        data-test-id="eto-registration-legal-information-submit"
      >
        <FormattedMessage id="form.button.save" />
      </Button>
    </Section>
  </EtoFormBase>
);

const EtoRegistrationLegalInformation = connectEtoRegistrationLegalInformation(
  EtoRegistrationLegalInformationComponent,
);

export { EtoRegistrationLegalInformation, EtoRegistrationLegalInformationComponent };
