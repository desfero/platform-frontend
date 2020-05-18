import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { InteractionManager, StyleSheet } from "react-native";
import * as Yup from "yup";

import { EAuthState } from "../../modules/auth/module";
import { walletEthModuleApi } from "../../modules/eth/module";
import { spacingStyles } from "../../styles/spacings";
import { TComponentRefType } from "../../utils/types";
import { oneOfSchema } from "../../utils/yupSchemas";
import { Button, EButtonLayout } from "../shared/buttons/Button";
import { Field } from "../shared/forms/fields/Field";
import { Form } from "../shared/forms/fields/Form";
import { EFieldType } from "../shared/forms/layouts/FieldLayout";
import { TextAreaInput } from "../shared/forms/layouts/TextAreaInput";

const ethereumPrivateKeyUISchema = walletEthModuleApi.utils
  .ethereumPrivateKey()
  .transform(value => {
    // Some tools generate private key without hex prefix
    // to allow importing such invalid private keys
    // add hex prefix manually if it doesn't exist
    if (!value.startsWith("0x")) {
      return "0x" + value;
    }

    return value;
  });

const validationSchema = Yup.object({
  phrase: oneOfSchema(
    [ethereumPrivateKeyUISchema, walletEthModuleApi.utils.ethereumMnemonic()],
    "Invalid recovery phrase or private key",
  ).required(),
});

type TFormValue = Yup.InferType<typeof validationSchema>;

const INITIAL_VALUES = {
  phrase: "" as TFormValue["phrase"],
};

type TExternalProps = {
  authState: EAuthState;
  importExistingAccount: (privateKeyOrMnemonic: string) => void;
};

const ImportAccountScreenForm: React.FunctionComponent<TExternalProps> = ({
  authState,
  importExistingAccount,
}) => {
  const navigation = useNavigation();

  const inputRef = React.useCallback(
    (ref: TComponentRefType<typeof TextAreaInput>) => {
      // focus needs to be done after all stack related animations have been finished
      // otherwise the input got's blurred almost immediately
      InteractionManager.runAfterInteractions(() => {
        // only focus input if the view is still focused
        if (ref && navigation.isFocused()) {
          ref.focus();
        }
      });
    },
    [navigation],
  );

  return (
    <Form<TFormValue>
      validationSchema={validationSchema}
      initialValues={INITIAL_VALUES}
      onSubmit={values => {
        const { phrase } = validationSchema.cast(values);
        importExistingAccount(phrase);
      }}
    >
      {({ handleSubmit, isValid }) => (
        <>
          <Field
            name="phrase"
            inputRef={inputRef}
            type={EFieldType.TEXT_AREA}
            helperText="Separate your 12/24 recovery phrase words with a space."
          />

          <Button
            style={styles.importAccountButton}
            disabled={!isValid}
            loading={authState === EAuthState.AUTHORIZING}
            layout={EButtonLayout.PRIMARY}
            onPress={handleSubmit}
          >
            Connect account
          </Button>
        </>
      )}
    </Form>
  );
};

const styles = StyleSheet.create({
  importAccountButton: {
    ...spacingStyles.mt2,
    ...spacingStyles.mb2,
  },
});

export { ImportAccountScreenForm };
