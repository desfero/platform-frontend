import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as ReduxProvider } from "react-redux";
import { Store } from "redux";

import { ThemeProvider } from "../../themes/ThemeProvider";

type TExternalProps = {
  store: Store;
};

const AppContainer: React.FunctionComponent<TExternalProps> = ({ children, store }) => (
  <ReduxProvider store={store}>
    <ThemeProvider>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </ThemeProvider>
  </ReduxProvider>
);

export { AppContainer };
