import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import React from "react";
import Config from "react-native-config";

import { EAppRoutes } from "./appRoutes";
import { ImportAccountScreen } from "./components/import-account/ImportAccountScreen";
import { LandingScreen } from "./components/landing/LandingScreen";
import { ModalStackHeaderLevel2 } from "./components/shared/modal-header/ModalStackHeaderLevel2";
import { SwitchAccountScreen } from "./components/switch-account/SwitchAccountScreen";
import { UnlockAccountScreen } from "./components/unlock-account/UnlockAccountScreen";
import { TAuthWalletMetadata } from "./modules/auth/module";
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
        options={{ header: ModalStackHeaderLevel2 }}
      />
      {Config.NF_CONTRACT_ARTIFACTS_VERSION === "localhost" && (
        <NoAuthStack.Screen
          name={EAppRoutes.switchAccount}
          component={SwitchAccountScreen}
          options={{ header: ModalStackHeaderLevel2, title: "Switch account" }}
        />
      )}
    </NoAuthStack.Navigator>
  );
};
export { AppNoAuthRouter };
