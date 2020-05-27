import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import React from "react";
import Config from "react-native-config";

import { ImportAccountScreen } from "components/screens/ImportAccountScreen/ImportAccountScreen";
import { LandingScreen } from "components/screens/LandingScreen/LandingScreen";
import { SwitchAccountScreen } from "components/screens/SwitchAccountScreen/SwitchAccountScreen";
import { UnlockAccountScreen } from "components/screens/UnlockAccountScreen/UnlockAccountScreen";
import { ModalStackHeader } from "components/shared/ModalStackHeader";

import { TAuthWalletMetadata } from "modules/auth/module";

import { EAppRoutes } from "./appRoutes";
import { RootStackParamList } from "./routeUtils";

const NoAuthStack = createStackNavigator<RootStackParamList>();

type TExternalProps = {
  authWallet: undefined | TAuthWalletMetadata;
};

const AppNoAuthRouter: React.FunctionComponent<TExternalProps> = ({ authWallet }) => {
  const hasAnAccountToUnlock = !!authWallet;

  return (
    <NoAuthStack.Navigator
      initialRouteName={hasAnAccountToUnlock ? EAppRoutes.unlockAccount : EAppRoutes.landing}
      screenOptions={({ route, navigation }) => ({
        ...TransitionPresets.ModalPresentationIOS,
        gestureEnabled: true,
        cardOverlayEnabled: true,
        headerStatusBarHeight:
          navigation.dangerouslyGetState().routes.indexOf(route) > 0 ? 0 : undefined,
      })}
      mode="modal"
    >
      <NoAuthStack.Screen
        name={EAppRoutes.landing}
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <NoAuthStack.Screen
        name={EAppRoutes.unlockAccount}
        component={UnlockAccountScreen}
        options={{ headerShown: false }}
      />
      <NoAuthStack.Screen
        name={EAppRoutes.importAccount}
        component={ImportAccountScreen}
        options={{ header: ModalStackHeader }}
      />
      {Config.NF_CONTRACT_ARTIFACTS_VERSION === "localhost" && (
        <NoAuthStack.Screen
          name={EAppRoutes.switchAccount}
          component={SwitchAccountScreen}
          options={{ header: ModalStackHeader, title: "Switch account" }}
        />
      )}
    </NoAuthStack.Navigator>
  );
};
export { AppNoAuthRouter };
