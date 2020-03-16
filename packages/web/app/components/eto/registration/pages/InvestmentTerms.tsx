import { Button, EButtonLayout } from "@neufund/design-system";
import {
  ECurrency,
  ENumberFormat,
  ENumberInputFormat,
  ENumberOutputFormat,
  EPriceFormat,
  formatNumber,
  selectDecimalPlaces,
  selectUnits,
  THumanReadableFormat,
  TValueFormat,
} from "@neufund/shared";
import { FormikConsumer } from "formik";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Col, Row } from "reactstrap";
import { branch, renderNothing, setDisplayName } from "recompose";
import { compose } from "redux";

import {
  EtoInvestmentTermsType,
  TEtoSpecsData,
} from "../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { etoFormIsReadonly } from "../../../../lib/api/eto/EtoApiUtils";
import {
  calcCapFraction,
  calcInvestmentAmount,
  calcNumberOfTokens,
  calcShareAndTokenPrice,
} from "../../../../lib/api/eto/EtoUtils";
import { TBigNumberVariants } from "../../../../lib/web3/types";
import { actions } from "../../../../modules/actions";
import {
  selectIssuerEto,
  selectIssuerEtoLoading,
  selectIssuerEtoSaving,
  selectIssuerEtoState,
} from "../../../../modules/eto-flow/selectors";
import { EEtoFormTypes } from "../../../../modules/eto-flow/types";
import { etoInvestmentTermsProgressOptions } from "../../../../modules/eto-flow/utils";
import { appConnect } from "../../../../store";
import { TTranslatedString } from "../../../../types";
import { FormField, FormHighlightGroup, FormMaskedNumberInput, Input } from "../../../shared/forms";
import {
  convert,
  convertFractionToPercentage,
  convertNumberToString,
  convertPercentageToFraction,
  parseStringToFloat,
  parseStringToInteger,
} from "../../utils";
import { EtoFormBase } from "../EtoFormBase";
import { Section } from "../Shared";

import * as styles from "../Shared.module.scss";

interface IExternalProps {
  readonly: boolean;
}

interface IStateProps {
  loadingData: boolean;
  savingData: boolean;
  eto: TEtoSpecsData;
}

interface ICalculatorProps {
  etoProductMaxInvestmentAmount: number;
}

interface IDispatchProps {
  saveData: (values: TEtoSpecsData) => void;
}

type IProps = IExternalProps & IStateProps & IDispatchProps;

interface ICalculatorField {
  value: TBigNumberVariants;
  name: string;
  label: TTranslatedString;
  valueType: TValueFormat;
  outputFormat: THumanReadableFormat;
}

const CalculatorField: React.FunctionComponent<ICalculatorField> = ({
  value,
  name,
  label,
  valueType,
  outputFormat,
}) => (
  <Input
    label={label}
    suffix={selectUnits(valueType)}
    name={name}
    value={formatNumber({
      value,
      inputFormat: ENumberInputFormat.FLOAT,
      outputFormat: outputFormat,
      decimalPlaces: selectDecimalPlaces(valueType, outputFormat),
    })}
    readOnly={true}
  />
);

const InvestmentCalculator: React.FunctionComponent<ICalculatorProps> = ({
  etoProductMaxInvestmentAmount,
}) => (
  <FormikConsumer>
    {({ values }) => {
      const fixedSlotsMaximumDiscountFraction = parseStringToFloat()(
        values.fixedSlotsMaximumDiscountFraction,
      );
      const whitelistDiscountFraction = parseStringToFloat()(values.whitelistDiscountFraction);
      const publicDiscountFraction = parseStringToFloat()(values.publicDiscountFraction);

      const calculatorValues = {
        newSharesToIssue: parseStringToFloat()(values.newSharesToIssue),
        minimumNewSharesToIssue: parseStringToFloat()(values.minimumNewSharesToIssue),
        existingShareCapital: parseStringToFloat()(values.existingShareCapital),
        newShareNominalValue: parseStringToFloat()(values.newShareNominalValue),
        preMoneyValuationEur: parseStringToFloat()(values.preMoneyValuationEur),
        newSharesToIssueInFixedSlots: parseStringToFloat()(values.newSharesToIssueInFixedSlots),
        newSharesToIssueInWhitelist: parseStringToFloat()(values.newSharesToIssueInWhitelist),
        fixedSlotsMaximumDiscountFraction: fixedSlotsMaximumDiscountFraction
          ? convertPercentageToFraction()(fixedSlotsMaximumDiscountFraction)
          : 0,
        whitelistDiscountFraction: fixedSlotsMaximumDiscountFraction
          ? convertPercentageToFraction()(whitelistDiscountFraction)
          : 0,
        publicDiscountFraction: fixedSlotsMaximumDiscountFraction
          ? convertPercentageToFraction()(publicDiscountFraction)
          : 0,
      };
      const { sharePrice, tokenPrice, tokensPerShare } = calcShareAndTokenPrice(calculatorValues);
      const { computedMaxNumberOfTokens, computedMinNumberOfTokens } = calcNumberOfTokens(
        calculatorValues,
      );
      const { computedMaxCapPercent, computedMinCapPercent } = calcCapFraction(calculatorValues);
      const { minInvestmentAmount, maxInvestmentAmount } = calcInvestmentAmount(
        calculatorValues,
        sharePrice,
      );

      return (
        <FormHighlightGroup>
          <CalculatorField
            value={sharePrice.toString()}
            name="newSharePrice"
            label={<FormattedMessage id="eto.form.section.investment-terms.new-share-price" />}
            valueType={EPriceFormat.SHARE_PRICE}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          />
          <CalculatorField
            value={tokensPerShare.toString()}
            name="equityTokensPerShare"
            label={<FormattedMessage id="eto.form.section.investment-terms.tokens-per-share" />}
            valueType={EPriceFormat.SHARE_PRICE}
            outputFormat={ENumberOutputFormat.INTEGER}
          />
          <CalculatorField
            value={tokenPrice.toString()}
            name="equityTokenPrice"
            label={<FormattedMessage id="eto.form.section.investment-terms.equity-token-price" />}
            valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          />
          <Row>
            <Col sm={12} md={6}>
              <CalculatorField
                value={minInvestmentAmount.toString()}
                name="minInvestmentAmount"
                label={<FormattedMessage id="eto.form.section.investment-terms.minimum-amount" />}
                valueType={ECurrency.EUR}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
              />
            </Col>
            <Col sm={12} md={6}>
              <CalculatorField
                value={maxInvestmentAmount.toString()}
                name="totalInvestment"
                label={<FormattedMessage id="eto.form.section.investment-terms.total-investment" />}
                valueType={ECurrency.EUR}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
              />
            </Col>
            {etoProductMaxInvestmentAmount !== 0 &&
              etoProductMaxInvestmentAmount < minInvestmentAmount && (
                <Col sm={12}>
                  <p className="text-error">
                    <FormattedMessage id="eto.form.investment-terms.min-investment-amount-warning" />
                  </p>
                </Col>
              )}
            {etoProductMaxInvestmentAmount !== 0 &&
              etoProductMaxInvestmentAmount < maxInvestmentAmount && (
                <Col sm={12}>
                  <p className="text-warning">
                    <FormattedMessage id="eto.form.investment-terms.max-investment-amount-warning" />
                  </p>
                </Col>
              )}
            <Col sm={12} md={6}>
              <CalculatorField
                value={computedMinNumberOfTokens.toString()}
                name="minCapEur"
                label={
                  <FormattedMessage id="eto.form.section.investment-terms.minimum-token-cap" />
                }
                valueType={ECurrency.EUR}
                outputFormat={ENumberOutputFormat.INTEGER}
              />
            </Col>
            <Col sm={12} md={6}>
              <CalculatorField
                value={computedMaxNumberOfTokens.toString()}
                name="maxCapEur"
                label={
                  <FormattedMessage id="eto.form.section.investment-terms.maximum-token-cap" />
                }
                valueType={ECurrency.EUR}
                outputFormat={ENumberOutputFormat.INTEGER}
              />
            </Col>
            <Col sm={12} md={6}>
              <CalculatorField
                value={computedMinCapPercent.toString()}
                name="minSharesGenerated"
                label={
                  <FormattedMessage id="eto.form.section.investment-terms.minimum-shares-generated" />
                }
                valueType={ENumberFormat.PERCENTAGE}
                outputFormat={ENumberOutputFormat.FULL}
              />
            </Col>
            <Col sm={12} md={6}>
              <CalculatorField
                value={computedMaxCapPercent.toString()}
                name="maxSharesGenerated"
                label={
                  <FormattedMessage id="eto.form.section.investment-terms.maximum-shares-generated" />
                }
                valueType={ENumberFormat.PERCENTAGE}
                outputFormat={ENumberOutputFormat.FULL}
              />
            </Col>
          </Row>
        </FormHighlightGroup>
      );
    }}
  </FormikConsumer>
);

const validate = (values: TEtoSpecsData) => {
  const errors: { -readonly [P in keyof typeof values]?: TTranslatedString } = {};

  if ((values.publicDiscountFraction || 0) > (values.whitelistDiscountFraction || 0)) {
    errors.whitelistDiscountFraction = (
      <FormattedMessage id="eto.form.investment-terms.errors.whitelist-discount-must-at-least-as-big-as-public-discount" />
    );
  }

  if ((values.fixedSlotsMaximumDiscountFraction || 0) < (values.publicDiscountFraction || 0)) {
    errors.fixedSlotsMaximumDiscountFraction = (
      <FormattedMessage id="eto.form.investment-terms.errors.fixed-slots-must-be-at-least-as-big-as-public-discount" />
    );
  }

  return errors;
};

const EtoInvestmentTermsComponent: React.FunctionComponent<IProps> = ({
  eto,
  savingData,
  saveData,
  readonly,
}) => (
  <EtoFormBase
    title={<FormattedMessage id="eto.form.investment-terms.title" />}
    progressOptions={etoInvestmentTermsProgressOptions}
    validationSchema={EtoInvestmentTermsType.toYup()}
    initialValues={convert(toFormState)(eto)}
    onSubmit={saveData}
    validate={validate}
  >
    <Section>
      <FormMaskedNumberInput
        name="preMoneyValuationEur"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.FULL}
        valueType={ECurrency.EUR}
        showUnits={true}
        disabled={readonly}
        label={
          <FormattedMessage id="eto.form.section.investment-terms.fully-diluted-pre-money-valuation" />
        }
      />
      <FormMaskedNumberInput
        name="existingShareCapital"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.INTEGER}
        disabled={readonly}
        placeholder="Amount of share capital"
        label={<FormattedMessage id="eto.form.section.investment-terms.existing-share-capital" />}
      />
      <FormField
        label={
          <FormattedMessage id="eto.form.section.investment-terms.share-capital-currency-code" />
        }
        name="shareCapitalCurrencyCode"
        disabled={readonly}
      />
      <FormMaskedNumberInput
        name="newShareNominalValue"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.FULL}
        valueType={ECurrency.EUR}
        showUnits={false}
        placeholder="1"
        disabled={readonly}
        label={<FormattedMessage id="eto.form.section.investment-terms.share-nominal-value" />}
      />
      <FormMaskedNumberInput
        name="newShareNominalValueEur"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.FULL}
        valueType={ECurrency.EUR}
        showUnits={true}
        placeholder="1"
        disabled={readonly}
        label={<FormattedMessage id="eto.form.section.investment-terms.share-nominal-value-eur" />}
      />
      <FormMaskedNumberInput
        name="authorizedCapital"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.INTEGER}
        disabled={readonly}
        placeholder="Amount of share capital"
        label={<FormattedMessage id="eto.form.section.investment-terms.authorized-capital" />}
      />
      <FormMaskedNumberInput
        name="minimumNewSharesToIssue"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.INTEGER}
        label={
          <FormattedMessage id="eto.form.section.investment-terms.minimum-new-shares-to-issue" />
        }
        placeholder="Number of shares"
        disabled={readonly}
      />
      <FormMaskedNumberInput
        name="newSharesToIssue"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.INTEGER}
        label={
          <FormattedMessage id="eto.form.section.investment-terms.maximum-new-shares-to-issue" />
        }
        placeholder="Number of shares"
        disabled={readonly}
      />
      {process.env.NF_SHOW_PUBLIC_DISCOUNT_FRACTION === "1" && (
        <FormMaskedNumberInput
          name="publicDiscountFraction"
          storageFormat={ENumberInputFormat.FLOAT}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          showUnits={true}
          valueType={ENumberFormat.PERCENTAGE}
          label={<FormattedMessage id="eto.form.section.investment-terms.public-discount" />}
          placeholder=" "
          disabled={readonly}
        />
      )}
      <FormMaskedNumberInput
        name="newSharesToIssueInWhitelist"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.INTEGER}
        label={
          <FormattedMessage id="eto.form.section.investment-terms.maximum-new-shares-to-issue-pre-eto" />
        }
        placeholder="Number of shares"
        disabled={readonly}
      />
      <FormMaskedNumberInput
        name="whitelistDiscountFraction"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
        showUnits={true}
        valueType={ENumberFormat.PERCENTAGE}
        label={<FormattedMessage id="eto.form.section.investment-terms.whitelist-discount" />}
        placeholder=" "
        disabled={readonly}
      />
      <FormMaskedNumberInput
        name="newSharesToIssueInFixedSlots"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.INTEGER}
        label={
          <FormattedMessage id="eto.form.section.investment-terms.maximum-shares-to-be-issued-in-fixed-slots" />
        }
        placeholder="Number of shares"
        disabled={readonly}
      />
      <FormMaskedNumberInput
        name="fixedSlotsMaximumDiscountFraction"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
        showUnits={true}
        valueType={ENumberFormat.PERCENTAGE}
        label={
          <FormattedMessage id="eto.form.section.investment-terms.maximum-discount-for-the-fixed-slot-investors" />
        }
        placeholder=" "
        disabled={readonly}
      />

      <InvestmentCalculator etoProductMaxInvestmentAmount={eto.product.maxInvestmentAmount} />
    </Section>

    {!readonly && (
      <Section className={styles.buttonSection}>
        <Button
          layout={EButtonLayout.OUTLINE}
          type="submit"
          isLoading={savingData}
          data-test-id="eto-registration-investment-terms-submit"
        >
          <FormattedMessage id="form.button.save" />
        </Button>
      </Section>
    )}
  </EtoFormBase>
);

const EtoInvestmentTerms = compose<React.FunctionComponent<IExternalProps>>(
  setDisplayName(EEtoFormTypes.EtoInvestmentTerms),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      loadingData: selectIssuerEtoLoading(s),
      savingData: selectIssuerEtoSaving(s),
      eto: selectIssuerEto(s)!,
      readonly: etoFormIsReadonly(EEtoFormTypes.EtoInvestmentTerms, selectIssuerEtoState(s)),
    }),
    dispatchToProps: dispatch => ({
      saveData: (eto: TEtoSpecsData) => {
        const convertedEto = convert(fromFormState)(eto);
        dispatch(actions.etoFlow.saveEtoStart(convertedEto));
      },
    }),
  }),
  branch<IStateProps>(props => props.eto === undefined, renderNothing),
)(EtoInvestmentTermsComponent);

const toFormState = {
  preMoneyValuationEur: convertNumberToString(),
  existingShareCapital: convertNumberToString(),
  minimumNewSharesToIssue: convertNumberToString(),
  newSharesToIssue: convertNumberToString(),
  newShareNominalValue: convertNumberToString(),
  newShareNominalValueEur: convertNumberToString(),
  authorizedCapital: convertNumberToString(),
  newSharesToIssueInWhitelist: convertNumberToString(),
  newSharesToIssueInFixedSlots: convertNumberToString(),
  whitelistDiscountFraction: [convertFractionToPercentage(), convertNumberToString()],
  publicDiscountFraction: [convertFractionToPercentage(), convertNumberToString()],
  fixedSlotsMaximumDiscountFraction: [convertFractionToPercentage(), convertNumberToString()],
};

const fromFormState = {
  whitelistDiscountFraction: [parseStringToFloat(), convertPercentageToFraction()],
  publicDiscountFraction: [parseStringToFloat(), convertPercentageToFraction()],
  fixedSlotsMaximumDiscountFraction: [parseStringToFloat(), convertPercentageToFraction()],
  preMoneyValuationEur: parseStringToInteger(),
  existingShareCapital: parseStringToInteger(),
  newSharesToIssueInFixedSlots: parseStringToInteger(),
  newSharesToIssueInWhitelist: parseStringToInteger(),
  newShareNominalValue: parseStringToFloat(),
  newShareNominalValueEur: parseStringToFloat(),
  minimumNewSharesToIssue: parseStringToInteger(),
  newSharesToIssue: parseStringToInteger(),
  authorizedCapital: parseStringToInteger(),
};

export { EtoInvestmentTerms, EtoInvestmentTermsComponent, InvestmentCalculator };

//TODO fix translations, typings
