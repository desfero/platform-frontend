import { FormikErrors } from "formik";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";
import * as Yup from "yup";

import {
  Button,
  EButtonWidth,
} from "../../../../../../design-system/dist/components/buttons/Button";
import { Checkbox } from "../../../../../../design-system/dist/components/inputs/Checkbox";
import { TextField } from "../../../../../../design-system/dist/components/inputs/TextField";
import { injectIntlHelpers } from "../../../../../../shared/dist/utils/injectIntlHelpers.unsafe";
import { IIntlHelpers } from "../../../../../../shared/src/utils/injectIntlHelpers.unsafe";
import { externalRoutes } from "../../../../config/externalRoutes";
import { TBrowserWalletFormValues } from "../../../../modules/wallet-selector/types";
import { Form } from "../../../shared/forms/Form";
import { getMessageTranslation } from "../../../translatedMessages/messages";
import { TMessage } from "../../../translatedMessages/utils";

import * as styles from "../../shared/RegisterWalletSelector.module.scss";

type TEmailTosFormProps = {
  intl: IIntlHelpers;
  isLoading: boolean;
  submitForm: (email: string, tos: boolean) => void;
  initialFormValues: TBrowserWalletFormValues;
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
  <Form<TBrowserWalletFormValues>
    validationSchema={validationSchema}
    initialValues={initialFormValues}
    initialErrors={
      { email: errorMessage && getMessageTranslation(errorMessage) } as FormikErrors<
        TBrowserWalletFormValues
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