import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { Label } from "./Label";

storiesOf("Atoms|Label", module).add("default", () => (
  <>
    <Label>Lorem ipsum...</Label>
  </>
));
