import { RouteProp } from "@react-navigation/native";
import React from "react";
import { WebView } from "react-native-webview";

import { EAppRoutes } from "router/appRoutes";
import { RootStackParamList } from "router/routeUtils";

type TCustomWebViewProps = {
  route: RouteProp<RootStackParamList, EAppRoutes.webView>;
};

const CustomWebView: React.FunctionComponent<TCustomWebViewProps> = ({ route }) => (
  <WebView source={{ uri: route.params.uri }} />
);

export { CustomWebView as WebView };
