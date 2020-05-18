import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { Text } from "react-native";

import { Touchable } from "./Touchable";

storiesOf("Atoms|Touchable", module).add("default", () => (
  <Touchable activeColor="yellow" onPress={action("onPress")}>
    <Text>Touch me</Text>
  </Touchable>
));
