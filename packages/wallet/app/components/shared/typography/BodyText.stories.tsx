import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { BodyBoldText, BodyText } from "./BodyText";

storiesOf("Atoms|BodyText", module).add("default", () => (
  <>
    <BodyText>Body text</BodyText>
    <BodyBoldText>Body bold text</BodyBoldText>
  </>
));
