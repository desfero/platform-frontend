import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { EHeadlineLevel, Headline } from "./Headline";

storiesOf("Atoms|Headline", module).add("default", () => (
  <>
    <Headline level={EHeadlineLevel.LEVEL1}>Headline 1</Headline>
    <Headline level={EHeadlineLevel.LEVEL2}>Headline 2</Headline>
    <Headline level={EHeadlineLevel.LEVEL3}>Headline 3</Headline>
    <Headline level={EHeadlineLevel.LEVEL4}>Headline 4</Headline>
  </>
));
