import { nonNullable } from "@neufund/shared-utils";
import Fuse from "fuse.js";
import * as React from "react";
import { StyleSheet } from "react-native";
import * as Yup from "yup";

import fixtures from "../../lib/contracts/fixtures.json";
import { authModuleAPI, EAuthState } from "../../modules/auth/module";
import { walletEthModuleApi } from "../../modules/eth/module";
import { appConnect } from "../../store/utils";
import { spacingStyles } from "../../styles/spacings";
import { SafeAreaScreen } from "../shared/Screen";
import { Button, EButtonLayout } from "../shared/buttons/Button";
import { Field } from "../shared/forms/fields/Field";
import { Form } from "../shared/forms/fields/Form";
import { EFieldType } from "../shared/forms/layouts/FieldLayout";

type TStateProps = {
  authState: ReturnType<typeof authModuleAPI.selectors.selectAuthState>;
};

type TDispatchProps = {
  importExistingAccount: (privateKeyOrMnemonic: string, name: string) => void;
};

const validationSchema = Yup.object({
  filter: Yup.string(),
  address: walletEthModuleApi.utils.ethereumAddress().required(),
});

type TFormValue = Yup.InferType<typeof validationSchema>;

const INITIAL_VALUES = {
  filter: "",
  address: "" as TFormValue["address"],
};

const UIFixtures = Object.values(fixtures).map(fixture => ({
  id: fixture.address,
  title: fixture.name,
  subTitle: fixture.address,
}));

const fuse = new Fuse(UIFixtures, { keys: ["id", "title"], shouldSort: false, threshold: 0.4 });

const SwitchAccountLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  authState,
  importExistingAccount,
}) => {
  return (
    <SafeAreaScreen contentContainerStyle={styles.content}>
      <Form<TFormValue>
        validationSchema={validationSchema}
        initialValues={INITIAL_VALUES}
        onSubmit={values => {
          const fixture = fixtures[values.address as keyof typeof fixtures];

          importExistingAccount(nonNullable(fixture.privateKey), nonNullable(fixture.name));
        }}
      >
        {({ handleSubmit, isValid, values }) => {
          const items = values.filter
            ? fuse.search(values.filter).map(result => result.item)
            : UIFixtures;

          return (
            <>
              <Field
                name="filter"
                type={EFieldType.INPUT}
                placeholder="Filter by name or address..."
              />

              <Field name="address" style={styles.list} type={EFieldType.SWITCHER} items={items} />

              <Button
                disabled={!isValid}
                loading={authState === EAuthState.AUTHORIZING}
                layout={EButtonLayout.PRIMARY}
                onPress={handleSubmit}
              >
                Connect account
              </Button>
            </>
          );
        }}
      </Form>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    ...spacingStyles.p4,
    flex: 1,
  },
  list: {
    ...spacingStyles.mt2,
    ...spacingStyles.mb5,
    flex: 1,
  },
});

const SwitchAccountScreen = appConnect<TStateProps, TDispatchProps>({
  stateToProps: state => ({
    authState: authModuleAPI.selectors.selectAuthState(state),
  }),
  dispatchToProps: dispatch => ({
    importExistingAccount: (privateKeyOrMnemonic: string, name: string) =>
      dispatch(authModuleAPI.actions.importAccount(privateKeyOrMnemonic, name, true)),
  }),
})(SwitchAccountLayout);

export { SwitchAccountScreen };
