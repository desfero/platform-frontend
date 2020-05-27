import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { View } from "react-native";

import { BodyBoldText, BodyText } from "./BodyText";
import { EHeadlineLevel, Headline } from "./Headline";
import { HelperText } from "./HelperText";
import { Text } from "./Text";

storiesOf("Atoms|Typography", module)
  .addDecorator((story: () => React.ReactNode) => <View style={{ padding: 25 }}>{story()}</View>)
  .add("all", () => (
    <>
      <Headline level={EHeadlineLevel.LEVEL1}>Headline 1</Headline>
      <Headline level={EHeadlineLevel.LEVEL2}>Headline 2</Headline>
      <Headline level={EHeadlineLevel.LEVEL3}>Headline 3</Headline>
      <BodyBoldText>Body-bold</BodyBoldText>
      <Headline level={EHeadlineLevel.LEVEL4}>Headline 4</Headline>
      <BodyText>Body text</BodyText>
      <Text>Text</Text>
      <HelperText>helper Text</HelperText>
    </>
  ));
