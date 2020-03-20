import "./storybook-overrides.scss";
import { addParameters, addDecorator } from "@storybook/react";
import { withA11y } from "@storybook/addon-a11y";
import { addReadme } from "storybook-readme";

import "../src/polyfills.sideEffect";

addDecorator(addReadme);
addDecorator(withA11y);

addParameters({
  readme: {
    codeTheme: "github",
  },
});
