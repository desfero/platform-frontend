import { getStorybookUI, configure } from "@storybook/react-native";

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

export { StorybookUIRoot };
