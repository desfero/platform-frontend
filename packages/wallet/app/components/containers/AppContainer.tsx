import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider } from "../../themes/ThemeProvider";

const AppContainer: React.FunctionComponent = ({ children }) => (
  <ThemeProvider>
    <SafeAreaProvider>{children}</SafeAreaProvider>
  </ThemeProvider>
);

export { AppContainer };
