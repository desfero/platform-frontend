import { assertNever } from "@neufund/shared-utils";
import React from "react";
import { ScrollView } from "react-native";

import { MenuItemButton, EMenuItemType, EMenuItemPosition } from "./MenuItem";
import type { TMenuItem } from "./MenuItem";

type TScrollViewProps = React.ComponentProps<typeof ScrollView>;

type TExternalProps = {
  items: TMenuItem[];
} & TScrollViewProps;

const getItemPosition = (index: number, length: number) => {
  switch (index) {
    case 0:
      return EMenuItemPosition.FIRST;
    case length - 1:
      return EMenuItemPosition.LAST;
    default:
      return EMenuItemPosition.UNKNOWN;
  }
};

/**
 * A menu that aligns with our design system.
 * For now only button menu item is supported
 */
const Menu: React.FunctionComponent<TExternalProps> = ({ items, ...props }) => (
  <ScrollView accessibilityRole="menu" {...props}>
    {items.map((item, index) => {
      switch (item.type) {
        case EMenuItemType.BUTTON:
          return (
            <MenuItemButton
              key={item.id}
              {...item}
              position={getItemPosition(index, items.length)}
            />
          );

        default:
          assertNever(item.type, "Not support menu item type");
      }
    })}
  </ScrollView>
);

export { Menu, EMenuItemType };
