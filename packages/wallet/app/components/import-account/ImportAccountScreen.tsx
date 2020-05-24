import * as React from "react";
import { StyleSheet } from "react-native";

import { authModuleAPI } from "../../modules/auth/module";
import { appConnect } from "../../store/utils";
import { baseGray, grayLighter2 } from "../../styles/colors";
import { spacingStyles } from "../../styles/spacings";
import { SafeAreaScreen } from "../shared/Screen";
import { BodyText } from "../shared/typography/BodyText";
import { EHeadlineLevel, Headline } from "../shared/typography/Headline";
import { ImportAccountScreenForm } from "./ImportAccountScreenForm";

type TStateProps = {
  authState: ReturnType<typeof authModuleAPI.selectors.selectAuthState>;
};

type TDispatchProps = {
  importExistingAccount: (privateKeyOrMnemonic: string) => void;
};

const ImportAccountLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  authState,
  importExistingAccount,
}) => {
  return (
    <SafeAreaScreen contentContainerStyle={styles.content}>
      <Headline style={styles.headline} level={EHeadlineLevel.LEVEL2}>
        Connect an account
      </Headline>

      <BodyText style={styles.paragraph}>
        Enter your recovery phrase/private key to import and connect your Ethereum wallet to
        Neufund.
      </BodyText>

      <ImportAccountScreenForm
        authState={authState}
        importExistingAccount={importExistingAccount}
      />
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    ...spacingStyles.p4,
    justifyContent: "flex-end",
    flex: 1,
  },
  headline: {
    color: baseGray,
  },
  paragraph: {
    ...spacingStyles.mv4,
    color: grayLighter2,
  },
});

const ImportAccountScreen = appConnect<TStateProps, TDispatchProps>({
  stateToProps: state => ({
    authState: authModuleAPI.selectors.selectAuthState(state),
  }),
  dispatchToProps: dispatch => ({
    importExistingAccount: (privateKeyOrMnemonic: string) =>
      dispatch(authModuleAPI.actions.importAccount(privateKeyOrMnemonic)),
  }),
})(ImportAccountLayout);

export { ImportAccountScreen };
