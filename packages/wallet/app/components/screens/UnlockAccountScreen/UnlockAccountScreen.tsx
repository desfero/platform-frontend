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
import { EHeadlineLevel, Headline } from "../../shared/typography/Headline";

type TStateProps = {
  authState: ReturnType<typeof authModuleAPI.selectors.selectAuthState>;
  authWallet: ReturnType<typeof authModuleAPI.selectors.selectAuthWallet>;
};

type TDispatchProps = {
  unlockAccount: () => void;
};

const UnlockAccountLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  unlockAccount,
  authState,
  authWallet,
}) => {
  const navigation = useNavigationTyped();

  return (
    <NeuGradientScreen style={styles.wrapper}>
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={logo} accessibilityIgnoresInvertColors />
      </View>

      <View style={styles.container}>
        <Headline level={EHeadlineLevel.LEVEL2} style={styles.headline}>
          Welcome back{authWallet?.name && `, ${authWallet?.name}`}
        </Headline>

        <Button
          style={styles.createAccountButton}
          loading={authState === EAuthState.AUTHORIZING}
          layout={EButtonLayout.PRIMARY}
          onPress={unlockAccount}
        >
          Unlock account
        </Button>

        {Config.NF_CONTRACT_ARTIFACTS_VERSION === "localhost" && (
          <Button
            layout={EButtonLayout.TEXT_DARK}
            onPress={() => navigation.navigate(EAppRoutes.switchAccount)}
          >
            Switch account
          </Button>
        )}
      </View>
    </NeuGradientScreen>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    ...spacingStyles.p4,
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
  createAccountButton: {
    ...spacingStyles.mb2,
  },
});

const UnlockAccountScreen = appConnect<TStateProps, TDispatchProps>({
  stateToProps: state => ({
    authState: authModuleAPI.selectors.selectAuthState(state),
    authWallet: authModuleAPI.selectors.selectAuthWallet(state),
  }),
  dispatchToProps: dispatch => ({
    unlockAccount: () => dispatch(authModuleAPI.actions.unlockAccount()),
  }),
})(UnlockAccountLayout);

export { UnlockAccountScreen };
