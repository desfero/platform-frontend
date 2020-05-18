import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { ErrorMessage } from "./ErrorMessage";

storiesOf("Atoms|ErrorMessage", module).add("default", () => (
  <>
    <ErrorMessage>Lorem ipsum...</ErrorMessage>
  </>
));
