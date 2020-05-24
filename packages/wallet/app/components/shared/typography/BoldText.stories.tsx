import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { BoldText } from "./BoldText";

storiesOf("Atoms|BoldText", module).add("default", () => <BoldText>A bold text</BoldText>);
