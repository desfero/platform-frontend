import { Button } from "@neufund/design-system";
import { IIntlProps, injectIntlHelpers } from "@neufund/shared-utils";
import * as cn from "classnames";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";
import { Col, Row } from "reactstrap";
import { compose } from "recompose";
import * as Yup from "yup";

import { actions } from "../../../../modules/actions";
import { appConnect } from "../../../../store";
import { Form, FormField } from "../../../shared/forms";
import { TMessage } from "../../../translatedMessages/utils";

import * as styles from "./RegisterLightWallet.module.scss";

const EMAIL = "email";
const PASSWORD = "password";
const REPEAT_PASSWORD = "repeatPassword";

export interface IFormValues {
  email: string;
  password: string;
  repeatPassword: string;
}

export interface IStateProps {
  isLoading?: boolean;
  errorMsg?: TMessage;
}

type TRegisterWalletExternalProps = { restore?: boolean };

interface IDispatchProps {
  submitForm: (values: IFormValues) => void;
}

const validationSchema = Yup.object().shape({
  [EMAIL]: Yup.string()
    .required()
    .email(),
  [PASSWORD]: Yup.string()
    .required()
    .min(8),
  [REPEAT_PASSWORD]: Yup.string()
    .required()
    .oneOf(
      [Yup.ref(PASSWORD)],
      <FormattedMessage id="wallet-selector.neuwallet.passwords-do-not-match" />,
    ),
});

const INITIAL_VALUES = {
  email: "",
  password: "",
  repeatPassword: "",
};

const RegisterLightWalletForm: React.FunctionComponent<IStateProps &
  IDispatchProps &
  IIntlProps &
  TRegisterWalletExternalProps> = ({ intl, isLoading, submitForm, restore }) => (
  <Form<IFormValues>
    validationSchema={validationSchema}
    initialValues={INITIAL_VALUES}
    onSubmit={values => submitForm(values)}
    className="my-3"
  >
    {({ isSubmitting, isValid }) => (
      <>
        <FormField
          placeholder={intl.formatIntlMessage("wallet-selector.register.email")}
          type="email"
          name={EMAIL}
          data-test-id="wallet-selector-register-email"
        />
        <FormField
          type="password"
          placeholder={intl.formatIntlMessage("wallet-selector.register.password")}
          name={PASSWORD}
          data-test-id="wallet-selector-register-password"
        />
        <FormField
          type="password"
          placeholder={intl.formatIntlMessage("wallet-selector.register.confirm-password")}
          name={REPEAT_PASSWORD}
          data-test-id="wallet-selector-register-confirm-password"
        />
        <div className="text-center my-4">
          <Button
            type="submit"
            isLoading={isSubmitting || isLoading}
            disabled={!isValid}
            data-test-id="wallet-selector-register-button"
          >
            {restore ? (
              <FormattedMessage id="wallet-selector.neuwallet.restore" />
            ) : (
              <FormattedMessage id="wallet-selector.neuwallet.register" />
            )}
          </Button>
        </div>
      </>
    )}
  </Form>
);

const RegisterEnhancedLightWalletForm = compose<
  IIntlProps & IStateProps & IDispatchProps & TRegisterWalletExternalProps,
  IStateProps & IDispatchProps & TRegisterWalletExternalProps
>(injectIntlHelpers)(RegisterLightWalletForm);

export const RegisterWalletComponent: React.FunctionComponent<IDispatchProps &
  IStateProps &
  TRegisterWalletExternalProps> = props => (
  <>
    {props.restore ? null : (
      <>
        <h2
          className={cn(styles.title, "text-center mb-4")}
          data-test-id="modals.wallet-selector.register-restore-light-wallet.title"
        >
          <FormattedMessage id="wallet-selector.neuwallet.register-prompt" />
        </h2>
        <p className={styles.explanation}>
          <FormattedMessage tagName="span" id="wallet-selector.neuwallet.explanation-1" />
        </p>
      </>
    )}
    <Row>
      <Col md={{ size: 8, offset: 2 }}>
        <RegisterEnhancedLightWalletForm {...props} />
      </Col>
    </Row>

    <p className={styles.note}>
      <FormattedHTMLMessage tagName="span" id="wallet-selector.neuwallet.explanation-2" />
    </p>
  </>
);

export const RegisterLightWallet = compose<
  IStateProps & IDispatchProps,
  TRegisterWalletExternalProps
>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      errorMsg: state.lightWalletWizard.errorMsg as TMessage,
      isLoading: state.lightWalletWizard.isLoading,
    }),
    dispatchToProps: dispatch => ({
      submitForm: (values: IFormValues) =>
        dispatch(actions.walletSelector.lightWalletRegister(values.email, values.password)),
    }),
  }),
)(RegisterWalletComponent);