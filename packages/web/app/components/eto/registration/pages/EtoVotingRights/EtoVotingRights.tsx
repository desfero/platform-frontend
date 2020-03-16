import { Button, EButtonLayout } from "@neufund/design-system";
import {
  ENumberInputFormat,
  ENumberOutputFormat,
  MAX_RESTRICTED_ACT_VOTING_DURATION,
  MAX_VOTING_DURATION,
  MAX_VOTING_FINALIZATION_DURATION,
  MIN_RESTRICTED_ACT_VOTING_DURATION,
  MIN_VOTING_DURATION,
  MIN_VOTING_FINALIZATION_DURATION,
} from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TPartialEtoSpecData } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { FormFieldLabel } from "../../../../shared/forms/fields/FormFieldLabel";
import { FormStaticRadioButton } from "../../../../shared/forms/fields/FormStaticRadioButton";
import {
  FormFieldError,
  FormMaskedNumberInput,
  FormRadioButton,
  FormSelectField,
} from "../../../../shared/forms/index";
import { convert } from "../../../utils";
import { EtoFormBase } from "../../EtoFormBase";
import { Section } from "../../Shared";
import { Nominee } from "../Nominee/Nominee";
import { AdvisoryBoard } from "./AdvisoryBoard";
import {
  connectEtoVotingRightsForm,
  EtoVotingRightsValidator,
  toFormState,
} from "./connectEtoVotingRightsForm";

import * as styles from "../../Shared.module.scss";

const LIQUIDATION_PREFERENCE_VALUES = [
  { key: "", option: "Choose liquidation preference" },
  { key: 0, option: 0 },
  { key: 1, option: 1 },
  { key: 1.5, option: 1.5 },
  { key: 2, option: 2 },
];

type TExternalProps = {
  readonly: boolean;
};

type TStateProps = {
  loadingData: boolean;
  savingData: boolean;
  stateValues: TPartialEtoSpecData;
  currentNomineeId: string | undefined;
  currentNomineeName: string | undefined;
};

type TDispatchProps = {
  saveData: (values: TPartialEtoSpecData) => void;
};

const EtoVotingRightsComponent: React.FunctionComponent<TExternalProps &
  TStateProps &
  TDispatchProps> = ({
  readonly,
  savingData,
  currentNomineeName,
  stateValues,
  currentNomineeId,
  saveData,
}) => {
  const values = React.useMemo(() => {
    const converted = convert(toFormState)(stateValues);

    converted.advisoryBoardSelector = converted.advisoryBoard && !!converted.advisoryBoard;

    return converted;
  }, []);

  return (
    <EtoFormBase
      title={<FormattedMessage id="eto.form.section.token-holders-rights.title" />}
      validationSchema={EtoVotingRightsValidator}
      initialValues={values}
      onSubmit={saveData}
    >
      <Section>
        <p>
          <FormattedMessage id="eto.form.section.token-holders-rights.explanation-text" />
        </p>

        <h5 className={styles.formSubtitle}>
          <FormattedMessage id="eto.form.section.token-holders-rights.nominee" />
        </h5>

        <Nominee
          currentNomineeName={currentNomineeName}
          currentNomineeId={currentNomineeId}
          readonly={readonly}
        />
      </Section>

      {currentNomineeId && (
        <>
          <Section>
            <h5 className={styles.formSubtitle}>
              <FormattedMessage id="eto.form.section.token-holders-rights.voting-rights" />
            </h5>
            <p>
              <FormattedMessage id="eto.form.section.token-holders-rights.voting-rights-explanation" />
            </p>

            <div className="form-group">
              <FormFieldLabel name="generalVotingDurationDays">
                <FormattedMessage id="eto.form.section.token-holders-rights.nominee-general-voting-rule" />
              </FormFieldLabel>
              <FormStaticRadioButton
                value="true"
                label={
                  <FormattedMessage id="eto.form.section.token-holders-rights.nominee-voting-rights-enabled" />
                }
              />
            </div>

            <div className="form-group">
              <FormFieldLabel name="generalVotingDurationDays">
                <FormattedMessage
                  id="eto.form.section.token-holders-rights.general-voting-duration-days"
                  values={{ min: MIN_VOTING_DURATION, max: MAX_VOTING_DURATION }}
                />
              </FormFieldLabel>
              <FormMaskedNumberInput
                disabled={readonly}
                name="generalVotingDurationDays"
                storageFormat={ENumberInputFormat.FLOAT}
                outputFormat={ENumberOutputFormat.INTEGER}
                placeholder="e.g. 10"
              />
            </div>

            <div className="form-group">
              <FormFieldLabel name="restrictedActVotingDurationDays">
                <FormattedMessage
                  id="eto.form.section.token-holders-rights.restricted-act-voting-duration-days"
                  values={{
                    min: MIN_RESTRICTED_ACT_VOTING_DURATION,
                    max: MAX_RESTRICTED_ACT_VOTING_DURATION,
                  }}
                />
              </FormFieldLabel>
              <FormMaskedNumberInput
                disabled={readonly}
                name="restrictedActVotingDurationDays"
                storageFormat={ENumberInputFormat.FLOAT}
                outputFormat={ENumberOutputFormat.INTEGER}
                placeholder="e.g. 14"
              />
            </div>

            <div className="form-group">
              <FormFieldLabel name="shareholdersVotingQuorum">
                <FormattedMessage id="eto.form.section.token-holders-rights.shareholders-voting-quorum" />
              </FormFieldLabel>
              <FormMaskedNumberInput
                disabled={readonly}
                name="shareholdersVotingQuorum"
                storageFormat={ENumberInputFormat.FLOAT}
                outputFormat={ENumberOutputFormat.INTEGER}
                suffix={
                  <FormattedMessage id="eto.form.section.token-holders-rights.shareholders-voting-quorum-suffix" />
                }
              />
            </div>

            <div className="form-group">
              <FormFieldLabel name="votingMajorityFraction">
                <FormattedMessage id="eto.form.section.token-holders-rights.shareholders-voting-majority-fraction" />
              </FormFieldLabel>
              <FormMaskedNumberInput
                disabled={true}
                name="votingMajorityFraction"
                storageFormat={ENumberInputFormat.FLOAT}
                outputFormat={ENumberOutputFormat.INTEGER}
                prefix={
                  <FormattedMessage id="eto.form.section.token-holders-rights.shareholders-voting-majority-fraction-prefix" />
                }
                suffix={
                  <FormattedMessage id="eto.form.section.token-holders-rights.shareholders-voting-majority-fraction-suffix" />
                }
              />
            </div>

            <div className="form-group">
              <FormFieldLabel name="votingFinalizationDurationDays">
                <FormattedMessage
                  id="eto.form.section.token-holders-rights.voting-finalization-duration"
                  values={{
                    min: MIN_VOTING_FINALIZATION_DURATION,
                    max: MAX_VOTING_FINALIZATION_DURATION,
                  }}
                />
              </FormFieldLabel>
              <FormMaskedNumberInput
                disabled={readonly}
                name="votingFinalizationDurationDays"
                storageFormat={ENumberInputFormat.FLOAT}
                outputFormat={ENumberOutputFormat.INTEGER}
              />
            </div>
          </Section>

          <Section>
            <h5 className={styles.formSubtitle}>
              <FormattedMessage id="eto.form.section.token-holders-rights.voting-rights-for-token-holders" />
            </h5>
            <p>
              <FormattedMessage id="eto.form.section.token-holders-rights.voting-rights-for-token-holders-explanation" />
            </p>

            <div className="form-group">
              <FormFieldLabel name="generalVotingRule">
                <FormattedMessage id="eto.form.section.token-holders-rights.token-holders-general-voting-rule" />
              </FormFieldLabel>
              <FormStaticRadioButton
                value="true"
                label={
                  <FormattedMessage id="eto.form.section.token-holders-rights.token-holders-general-voting-rule-label" />
                }
              />
            </div>

            <div className="form-group">
              <FormFieldLabel name="tagAlongVotingRule">
                <FormattedMessage id="eto.form.section.token-holders-rights.tag-along-voting-rule" />
              </FormFieldLabel>
              <FormStaticRadioButton
                value="true"
                label={
                  <FormattedMessage id="eto.form.section.token-holders-rights.tag-along-voting-rule-label" />
                }
              />
            </div>

            <div className="form-group">
              <FormFieldLabel name="votingMajorityFraction">
                <FormattedMessage id="eto.form.section.token-holders-rights.token-holders-voting-majority-fraction" />
              </FormFieldLabel>
              <FormMaskedNumberInput
                disabled={true}
                name="votingMajorityFraction"
                storageFormat={ENumberInputFormat.FLOAT}
                outputFormat={ENumberOutputFormat.INTEGER}
                prefix={
                  <FormattedMessage id="eto.form.section.token-holders-rights.shareholders-voting-majority-fraction-prefix" />
                }
                suffix={
                  <FormattedMessage id="eto.form.section.token-holders-rights.token-holders-voting-majority-fraction-suffix" />
                }
              />
            </div>
          </Section>

          <Section>
            <h5 className={styles.formSubtitle}>
              <FormattedMessage id="eto.form.section.token-holders-rights.further-shareholder-rights" />
            </h5>

            <FormSelectField
              customOptions={LIQUIDATION_PREFERENCE_VALUES.map(({ key, option }) => (
                <option key={key} value={key}>
                  {option}
                </option>
              ))}
              label={
                <FormattedMessage id="eto.form.section.token-holders-rights.liquidation-preference" />
              }
              name="liquidationPreferenceMultiplier"
              disabled={readonly}
            />

            <div className="form-group">
              <FormFieldLabel name="hasGeneralInformationRights">
                <FormattedMessage id="eto.form.section.token-holders-rights.has-general-information-rights" />
              </FormFieldLabel>
              <FormStaticRadioButton
                value="true"
                label={
                  <FormattedMessage id="eto.form.section.token-holders-rights.has-general-information-rights-label" />
                }
              />
            </div>

            <div className="form-group">
              <FormFieldLabel name="hasDividendRights">
                <FormattedMessage id="eto.form.section.token-holders-rights.has-dividend-rights" />
              </FormFieldLabel>
              <FormStaticRadioButton
                value="true"
                label={
                  <FormattedMessage id="eto.form.section.token-holders-rights.has-dividend-rights-label" />
                }
              />
            </div>
          </Section>

          <Section>
            <h5 className={styles.formSubtitle}>
              <FormattedMessage id="eto.form.section.token-holders-rights.existing-company-rules" />
            </h5>
            <AdvisoryBoard readonly={readonly} />

            <div className="form-group">
              <FormFieldLabel name="hasDragAlongRights">
                <FormattedMessage id="eto.form.section.token-holders-rights.has-drag-along-rights" />
              </FormFieldLabel>
              <div className={styles.radioButtonGroup}>
                <FormStaticRadioButton
                  value="true"
                  label={<FormattedMessage id="form.select.yes" />}
                />
              </div>
            </div>

            <div className="form-group">
              <FormFieldLabel name="hasTagAlongRights">
                <FormattedMessage id="eto.form.section.token-holders-rights.has-tag-along-rights" />
              </FormFieldLabel>
              <div className={styles.radioButtonGroup}>
                <FormStaticRadioButton
                  value="true"
                  label={<FormattedMessage id="form.select.yes" />}
                />
              </div>
            </div>

            <div className="form-group">
              <FormFieldLabel name="hasFoundersVesting">
                <FormattedMessage id="eto.form.section.token-holders-rights.has-founders-vesting" />
              </FormFieldLabel>
              <div className={styles.radioButtonGroup}>
                <FormRadioButton
                  name="hasFoundersVesting"
                  value={true}
                  label={<FormattedMessage id="form.select.yes" />}
                  disabled={readonly}
                />
                <FormRadioButton
                  name="hasFoundersVesting"
                  label={<FormattedMessage id="form.select.no" />}
                  value={false}
                  disabled={readonly}
                />
                <FormFieldError name="hasFoundersVesting" />
              </div>
            </div>
          </Section>
        </>
      )}

      {!readonly && currentNomineeId && (
        <Section className={styles.buttonSection}>
          <Button
            layout={EButtonLayout.OUTLINE}
            type="submit"
            isLoading={savingData}
            data-test-id="eto-registration-voting-rights-submit"
          >
            <FormattedMessage id="form.button.save" />
          </Button>
        </Section>
      )}
    </EtoFormBase>
  );
};

const EtoVotingRights = connectEtoVotingRightsForm(EtoVotingRightsComponent);

export { EtoVotingRightsComponent, EtoVotingRights, TExternalProps, TStateProps, TDispatchProps };
