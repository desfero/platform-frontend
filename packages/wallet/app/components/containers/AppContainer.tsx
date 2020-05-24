import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import React from "react";
import { IntlProvider } from "react-intl";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider } from "../../themes/ThemeProvider";

const AppContainer: React.FunctionComponent = ({ children }) => (
  <ThemeProvider>
    <IntlProvider locale="en-gb">
      <ActionSheetProvider>
        <SafeAreaProvider>{children}</SafeAreaProvider>
      </ActionSheetProvider>
    </IntlProvider>
  </ThemeProvider>
);

export { AppContainer };
