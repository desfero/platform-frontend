import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { EIconType } from "../Icon";
import { EMenuItemType, Menu } from "./Menu";

const switcherItemsWithTitleAndHelptext = [
  {
    id: "switch-account",
    heading: "Switch account",
    type: EMenuItemType.BUTTON,
    onPress: action("onPress"),
    icon: EIconType.WALLET,
    helpText: "0x429123b08DF32b0006fd1F3b0Ef893A8993802f3",
  },
  {
    id: "logout",
    heading: "Logout",
    type: EMenuItemType.BUTTON,
    onPress: action("onPress"),
    icon: EIconType.PLACEHOLDER,
    helpText: "This will cleanup your storage",
  },
];

const switcherItemsWithTitle = [
  {
    id: "switch-account",
    heading: "Switch account",
    type: EMenuItemType.BUTTON,
    onPress: action("onPress"),
    icon: EIconType.PLACEHOLDER,
  },
  {
    id: "logout",
    heading: "Logout",
    type: EMenuItemType.BUTTON,
    onPress: action("onPress"),
    icon: EIconType.PLACEHOLDER,
  },
];

storiesOf("Molecules|Menu", module)
  .add("with title and sub title", () => <Menu items={switcherItemsWithTitleAndHelptext} />)
  .add("with title", () => <Menu items={switcherItemsWithTitle} />);

export { switcherItemsWithTitle, switcherItemsWithTitleAndHelptext };
