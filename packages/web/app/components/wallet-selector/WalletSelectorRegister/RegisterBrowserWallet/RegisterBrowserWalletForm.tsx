import { Button, Checkbox, EButtonLayout, EButtonWidth, TextField } from "@neufund/design-system";
import { IIntlHelpers, injectIntlHelpers } from "@neufund/shared-utils";
import { FormikErrors } from "formik";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";
import * as Yup from "yup";

import { externalRoutes } from "../../../../config/externalRoutes";
import { TGenericWalletFormValues } from "../../../../modules/wallet-selector/types";
import { Form } from "../../../shared/forms/Form";
import { getMessageTranslation } from "../../../translatedMessages/messages";
import { TMessage } from "../../../translatedMessages/utils";

import * as styles from "../../shared/RegisterWalletSelector.module.scss";

type TEmailTosFormProps = {
  intl: IIntlHelpers;
  isLoading: boolean;
  submitForm: (email: string, tos: boolean) => void;
  initialFormValues: TGenericWalletFormValues;
  errorMessage: TMessage | undefined;
};

const EMAIL = "email";
const TOS = "tos";

const validationSchema = Yup.object().shape({
  [EMAIL]: Yup.string()
    .required()
    .email(),
  [TOS]: Yup.boolean()
    .required()
    .test(
      "tos-is-true",
      <FormattedMessage id="wallet-selector.register.accept.tos" />,
      value => value === true,
    ),
});

export const BrowserWalletAskForEmailAndTosForm: React.FunctionComponent<TEmailTosFormProps> = ({
  intl,
  isLoading,
  submitForm,
  initialFormValues,
  errorMessage,
}) => (
  <Form<TGenericWalletFormValues>
    validationSchema={validationSchema}
    initialValues={initialFormValues}
    initialErrors={
      { email: errorMessage && getMessageTranslation(errorMessage) } as FormikErrors<
        TGenericWalletFormValues
      >
    }
    initialTouched={{ email: !!errorMessage }}
    validateOnMount={!errorMessage}
    validateOnBlur={false}
    onSubmit={values => submitForm(values.email, values.tos)}
    className={styles.form}
  >
    {({ isSubmitting, isValid }) => (
      <>
        <TextField
          type="text"
          isRequired={true}
          name={EMAIL}
          placeholder={intl.formatIntlMessage("wallet-selector.register.email.placeholder")}
          label={intl.formatIntlMessage("wallet-selector.register.email")}
          data-test-id="wallet-selector-register-email"
        />
        <Checkbox
          label={
            <FormattedHTMLMessage
              tagName="span"
              id="wallet-selector.register.tos"
              values={{ href: externalRoutes.tos }}
            />
          }
          name={TOS}
          data-test-id="wallet-selector-register-tos"
        />
        <Button
          type="submit"
          isLoading={isSubmitting || isLoading}
          disabled={!isValid}
          data-test-id="wallet-selector-register-button"
          width={EButtonWidth.BLOCK}
          layout={EButtonLayout.PRIMARY}
        >
          <FormattedMessage id="wallet-selector.sign-up" />
        </Button>
      </>
    )}
  </Form>
);

export const BrowserWalletAskForEmailAndTos = compose<TEmailTosFormProps, TEmailTosFormProps>(
  injectIntlHelpers,
)(BrowserWalletAskForEmailAndTosForm);
