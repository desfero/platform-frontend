import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { Text } from "react-native";

import { Panel, PanelTouchable } from "./Panel";

storiesOf("Atoms|Panel", module)
  .add("Panel", () => (
    <Panel>
      <Text>Custom panel content</Text>
    </Panel>
  ))
  .add("PanelTouchable", () => (
    <PanelTouchable onPress={action("onPress")}>
      <Text>Custom panel content</Text>
    </PanelTouchable>
  ));
