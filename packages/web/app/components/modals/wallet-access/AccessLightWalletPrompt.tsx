import { Button, EButtonLayout } from "@neufund/design-system";
import { FormikProps, withFormik } from "formik";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TTranslatedString } from "../../../types";
import { FormDeprecated, FormField } from "../../shared/forms";

interface IStateProps {
  inputLabel?: TTranslatedString;
}

interface IOwnProps {
  onCancel?: () => void;
  onAccept: (password?: string) => void;
}

type IProps = IStateProps & IOwnProps;

export interface IFormValues {
  password: string;
}

const AccessLightWalletForm = (formikBag: FormikProps<IFormValues> & IProps) => (
  <FormDeprecated className="mb-0">
    <div className="ml-sm-5 mr-sm-5">
      <FormField
        type="password"
        placeholder="Password"
        name="password"
        data-test-id="access-light-wallet-password-input"
      />
    </div>
    <div className="mt-3">
      <Button
        type="submit"
        layout={EButtonLayout.LINK}
        disabled={!formikBag.values.password}
        data-test-id="access-light-wallet-confirm"
      >
        <FormattedMessage id="modal.light-wallet.button.accept" />
      </Button>
    </div>
  </FormDeprecated>
);

const EnhancedForm = withFormik<IProps, IFormValues>({
  handleSubmit: (values, { props }) => props.onAccept(values.password),
})(AccessLightWalletForm);

export const AccessLightWalletPrompt: React.FunctionComponent<IProps> = props => (
  <div data-test-id="access-light-wallet-locked">
    <p>{props.inputLabel || <FormattedMessage id="modal.light-wallet.message" />}</p>
    <EnhancedForm {...props} />
  </div>
);
