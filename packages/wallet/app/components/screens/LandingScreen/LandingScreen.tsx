import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Config from "react-native-config";

import logo from "../../../../assets/images/logo.png";
import { authModuleAPI, EAuthState } from "../../../modules/auth/module";
import { EAppRoutes } from "../../../router/appRoutes";
import { useNavigationTyped } from "../../../router/routeUtils";
import { appConnect } from "../../../store/utils";
import { silverLighter2 } from "../../../styles/colors";
import { spacingStyles } from "../../../styles/spacings";
import { NeuGradientScreen } from "../../shared/NeuGradientScreen";
import { Button, EButtonLayout } from "../../shared/buttons/Button";
import { BodyText } from "../../shared/typography/BodyText";
import { EHeadlineLevel, Headline } from "../../shared/typography/Headline";

type TStateProps = {
  authState: ReturnType<typeof authModuleAPI.selectors.selectAuthState>;
};

type TDispatchProps = {
  createAccount: () => void;
};

const LandingLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  createAccount,
  authState,
}) => {
  const navigation = useNavigationTyped();

  return (
    <NeuGradientScreen style={styles.wrapper}>
      <View style={styles.logoContainer}>
        <Image accessibilityIgnoresInvertColors style={styles.logo} source={logo} />
      </View>

      <View style={styles.container}>
        <Headline level={EHeadlineLevel.LEVEL1} style={styles.headline}>
          Welcome
        </Headline>

        <BodyText style={styles.paragraph}>
          Join Neufund today. Setup your account to start investing.
        </BodyText>

        <Button
          style={styles.button}
          loading={authState === EAuthState.AUTHORIZING}
          layout={EButtonLayout.PRIMARY}
          onPress={createAccount}
        >
          Create a new account
        </Button>

        <Button
          style={styles.button}
          layout={EButtonLayout.TEXT_DARK}
          onPress={() => navigation.navigate(EAppRoutes.importAccount)}
        >
          Import account
        </Button>

        {Config.NF_CONTRACT_ARTIFACTS_VERSION === "localhost" && (
          <Button
            layout={EButtonLayout.TEXT_DARK}
            onPress={() => navigation.navigate(EAppRoutes.switchAccount)}
          >
            Import fixture
          </Button>
        )}
      </View>
    </NeuGradientScreen>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    ...spacingStyles.p5,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1.2,
  },
  logo: {
    width: 64,
    height: 74,
  },
  container: {
    justifyContent: "center",
    flex: 1.5,
  },
  headline: {
    ...spacingStyles.mb4,
    textAlign: "center",
    color: silverLighter2,
  },
  paragraph: {
    ...spacingStyles.mb5,
    ...spacingStyles.ph5,
    textAlign: "center",
    color: silverLighter2,
  },
  button: {
    ...spacingStyles.mb2,
  },
});

const LandingScreen = appConnect<TStateProps, TDispatchProps>({
  stateToProps: state => ({
    authState: authModuleAPI.selectors.selectAuthState(state),
  }),
  dispatchToProps: dispatch => ({
    createAccount: () => dispatch(authModuleAPI.actions.createAccount()),
  }),
})(LandingLayout);

export { LandingScreen };
