import React from "react";
import { IntlProvider } from "react-intl";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider } from "../../themes/ThemeProvider";

const AppContainer: React.FunctionComponent = ({ children }) => (
  <ThemeProvider>
    <IntlProvider locale="en-gb">
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </IntlProvider>
  </ThemeProvider>
);

export { AppContainer };
