import { assertNever } from "@neufund/shared-utils";
import React from "react";
import { ScrollView } from "react-native";

import { MenuItemButton } from "./MenuItemButton";
import { MenuItemNavigation } from "./MenuItemNavigation";

type TScrollViewProps = React.ComponentProps<typeof ScrollView>;

enum EMenuItemType {
  NAVIGATION = "navigation",
  BUTTON = "button",
}

type TMenuItem =
  | ({ type: EMenuItemType.NAVIGATION } & React.ComponentProps<typeof MenuItemNavigation>)
  | ({ type: EMenuItemType.BUTTON } & React.ComponentProps<typeof MenuItemButton>);

type TExternalProps = {
  items: TMenuItem[];
} & TScrollViewProps;

/**
 * A menu that aligns with our design system.
 * For now only button menu item is supported
 */
const Menu: React.FunctionComponent<TExternalProps> = ({ items, ...props }) => (
  <ScrollView accessibilityRole="menu" {...props}>
    {items.map(item => {
      switch (item.type) {
        case EMenuItemType.NAVIGATION:
          return <MenuItemNavigation key={item.id} {...item} />;

        case EMenuItemType.BUTTON:
          return <MenuItemButton key={item.id} {...item} />;

        default:
          assertNever(item, "Not support menu item type");
      }
    })}
  </ScrollView>
);

export { Menu, EMenuItemType };
