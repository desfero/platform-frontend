import { FormikProps, withFormik } from "formik";
import * as PropTypes from "prop-types";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Col, Row } from "reactstrap";
import { compose } from "redux";

import { appConnect } from "../../../../store";
import { onEnterAction } from "../../../../utils/OnEnterAction";
import {
  BOOL_TRUE_KEY,
  FormField,
  FormSelectField,
  FormTextArea,
} from "../../../shared/forms/forms";

import { EtoTermsType, EtoVotingRightsType, TPartialEtoSpecData } from "../../../../lib/api/eto/EtoApi.interfaces";
import { actions } from "../../../../modules/actions";
import { Button } from "../../../shared/Buttons";
import { FormCheckbox } from "../../../shared/forms/formField/FormCheckbox";
import {
  FormFieldCheckbox,
  FormFieldCheckboxGroup,
} from "../../../shared/forms/formField/FormFieldCheckboxGroup";
import { FormLabel } from "../../../shared/forms/formField/FormLabel";
import { FormRange } from "../../../shared/forms/formField/FormRange";
import { FormSingleFileUpload } from "../../../shared/forms/formField/FormSingleFileUpload";
import { FormToggle } from "../../../shared/forms/formField/FormToggle";
import { FormHighlightGroup } from "../../../shared/forms/FormHighlightGroup";
import { FormSection } from "../../../shared/forms/FormSection";
import { CURRENCIES } from "../../EtoPublicView";
import { EtoFormBase } from "../EtoFormBase";

const TOKEN_HOLDERS_RIGHTS = {
  [BOOL_TRUE_KEY]: "Neumini UG",
};

const GENERAL_VOTING_RULE = {
  positive: <FormattedMessage id="form.select.yes" />,
  no_voting_rights: <FormattedMessage id="form.select.no" />,
};

interface IStateProps {
  loadingData: boolean;
  savingData: boolean;
  stateValues: TPartialEtoSpecData;
}

interface IDispatchProps {
  saveData: (values: TPartialEtoSpecData) => void;
}

type IProps = IStateProps & IDispatchProps;

const currencies = ["eth", "eur_t"];

class EtoForm extends React.Component<FormikProps<TPartialEtoSpecData> & IProps> {
  static contextTypes = {
    formik: PropTypes.object,
  };

  render(): React.ReactNode {
    const { stateValues } = this.props;
    const fullyDilutedPreMoneyValuationEur = stateValues.fullyDilutedPreMoneyValuationEur || 1;
    const existingCompanyShares = stateValues.existingCompanyShares || 1;
    const newSharesToIssue = stateValues.newSharesToIssue || 1;
    const equityTokensPerShare = stateValues.equityTokensPerShare || 1;
    const minimumNewSharesToIssue = stateValues.minimumNewSharesToIssue || 0;

    const computedNewSharePrice = fullyDilutedPreMoneyValuationEur / existingCompanyShares;
    const computedMinNumberOfTokens = newSharesToIssue * equityTokensPerShare;
    const computedMaxNumberOfTokens = minimumNewSharesToIssue * equityTokensPerShare;
    const computedMinCapEur = computedNewSharePrice * newSharesToIssue;
    const computedMaxCapEur = computedNewSharePrice * minimumNewSharesToIssue;

    return (
      <EtoFormBase
        title={<FormattedMessage id="eto.form.eto-voting-rights.title" />}
        validator={EtoVotingRightsType.toYup()}
      >
        <FormSelectField
          values={TOKEN_HOLDERS_RIGHTS}
          label={
            <FormattedMessage id="eto.form.section.token-holders-rights.third-party-dependency" />
          }
          name="nominee"
        />
        <div className="form-group">
          <FormLabel>
            <FormattedMessage id="eto.form.section.token-holders-rights.liquidation-preference" />
          </FormLabel>
          <FormRange name="liquidationPreferenceMultiplier" min={0} unit="x" max={2} step={0.5} />
        </div>

        <FormSelectField
          values={GENERAL_VOTING_RULE}
          label={
            <FormattedMessage id="eto.form.section.token-holders-rights.general-voting-rule" />
          }
          name="generalVotingRule"
        />
        <Col>
          <Row className="justify-content-end">
            <Button
              layout="primary"
              className="mr-4"
              type="submit"
              onClick={() => {
                this.props.saveData(this.props.values);
              }}
              isLoading={this.props.savingData}
            >
              <FormattedMessage id="form.button.save" />
            </Button>
          </Row>
        </Col>
      </EtoFormBase>
    );
  }
}

const EtoEnhancedForm = withFormik<IProps, TPartialEtoSpecData>({
  validationSchema: EtoVotingRightsType.toYup(),
  mapPropsToValues: props => props.stateValues,
  handleSubmit: (values, props) => props.props.saveData(values),
})(EtoForm);

export const EtoVotingRightsComponent: React.SFC<IProps> = props => (
  <EtoEnhancedForm {...props} />
);

export const EtoVotingRights = compose<React.SFC>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      loadingData: s.etoFlow.loading,
      savingData: s.etoFlow.saving,
      stateValues: s.etoFlow.etoData,
    }),
    dispatchToProps: dispatch => ({
      saveData: (data: TPartialEtoSpecData) => {
        data.isCrowdfunding = false; // Temporary solution - overrides checked value
        dispatch(
          actions.etoFlow.saveDataStart({
            companyData: {},
            etoData: {
              ...data,
            },
          }),
        );
      },
    }),
  }),
  onEnterAction({
    actionCreator: _dispatch => { },
  }),
)(EtoVotingRightsComponent);
