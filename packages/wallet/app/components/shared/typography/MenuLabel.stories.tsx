import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { MenuLabel, MenuLabelBold } from "./MenuLabel";

storiesOf("Atoms|MenuLabel", module).add("default", () => (
  <>
    <MenuLabel>Headline 1</MenuLabel>
    <MenuLabelBold>Headline 2</MenuLabelBold>
  </>
));
