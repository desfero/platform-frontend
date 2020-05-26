import { getStorybookUI, configure } from "@storybook/react-native";
import React from "react";
import { InteractionManager } from "react-native";
import RNBootSplash from "react-native-bootsplash";
import { IntlProvider } from "react-intl";

import "./rn-addons";

// import stories
configure(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./stories");
}, module);

// Refer to https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
// To find allowed options for getStorybookUI
// replace asyncStorage with proper one when we have it

// issue with storybook server https://github.com/storybookjs/react-native/issues/13
const StorybookUIRoot = getStorybookUI({ asyncStorage: null });

const Storybook: React.FunctionComponent = () => {
  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      // we do have custom logic when to hide splash screen for the normal flow
      // for storybook we can hide just when we have UI ready
      RNBootSplash.hide();
    });
  }, []);

  return (
    <IntlProvider locale="en-gb">
      <StorybookUIRoot />
    </IntlProvider>
  );
};

export { Storybook };
