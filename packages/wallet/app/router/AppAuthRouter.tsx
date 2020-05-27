import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import React from "react";
import Config from "react-native-config";

import { QRCode } from "components/QRCode";
import { SwitchAccountScreen } from "components/screens/SwitchAccountScreen/SwitchAccountScreen";
import { WebView } from "components/screens/WebViewScreen/WebViewScreen";
import { ModalStackHeader } from "components/shared/ModalStackHeader";

import { AppAuthRouterTabs } from "./AppAuthRouterTabs";
import { EAppRoutes } from "./appRoutes";
import { RootStackParamList } from "./routeUtils";

const Stack = createStackNavigator<RootStackParamList>();

const AppAuthRouter: React.FunctionComponent = () => (
  <>
    <Stack.Navigator
      initialRouteName={EAppRoutes.home}
      screenOptions={({ route, navigation }) => ({
        ...TransitionPresets.ModalPresentationIOS,
        gestureEnabled: true,
        cardOverlayEnabled: true,
        headerStatusBarHeight: navigation.dangerouslyGetState().routes.includes(route)
          ? 0
          : undefined,
      })}
      mode="modal"
      headerMode="screen"
    >
      <Stack.Screen
        name={EAppRoutes.home}
        component={AppAuthRouterTabs}
        options={{
          title: "Back",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={EAppRoutes.qrCode}
        component={QRCode}
        options={{
          title: "Scan QR code",
          header: ModalStackHeader,
        }}
      />
      {Config.NF_CONTRACT_ARTIFACTS_VERSION === "localhost" && (
        <Stack.Screen
          name={EAppRoutes.switchAccount}
          component={SwitchAccountScreen}
          options={{ header: ModalStackHeader, title: "Switch account" }}
        />
      )}
      <Stack.Screen
        name={EAppRoutes.webView}
        component={WebView}
        options={{
          header: ModalStackHeader,
        }}
      />
    </Stack.Navigator>
  </>
);

export { AppAuthRouter };
