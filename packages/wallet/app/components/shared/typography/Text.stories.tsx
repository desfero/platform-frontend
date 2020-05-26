import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { Text, TextBold } from "./Text";

storiesOf("Atoms|Text", module).add("default", () => (
  <>
    <Text>Body text</Text>
    <TextBold>Body bold text</TextBold>
  </>
));
