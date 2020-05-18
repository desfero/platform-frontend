import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { HelperText } from "./HelperText";

storiesOf("Atoms|HelperText", module).add("default", () => (
  <>
    <HelperText>Lorem ipsum...</HelperText>
  </>
));
