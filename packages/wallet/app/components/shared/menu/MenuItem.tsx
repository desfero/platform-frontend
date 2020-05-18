import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  baseGray,
  baseSilver,
  blueyGray,
  grayLighter1,
  grayLighter4,
} from "../../../styles/colors";
import { spacingStyles } from "../../../styles/spacings";
import { EIconType, Icon } from "../Icon";
import { BodyText } from "../typography/BodyText";
import { Text } from "../typography/Text";
import { st } from "../../utils";

enum EMenuItemPosition {
  FIRST = "first",
  LAST = "last",
  UNKNOWN = "UNKNOWN",
}

enum EMenuItemType {
  BUTTON = "button",
}

type TMenuItem = {
  id: string;
  type: EMenuItemType.BUTTON;
  onPress: (event: any) => void;
  icon: EIconType;
  heading: string;
  helperText?: string;
};

type TMenuItemButtonExternalProps = Extract<TMenuItem, { type: EMenuItemType.BUTTON }> & {
  position: EMenuItemPosition;
};

const MenuItemButton: React.FunctionComponent<TMenuItemButtonExternalProps> = ({
  heading,
  helperText,
  icon,
  position,
  onPress,
}) => (
  <TouchableOpacity
    style={st(styles.container)}
    activeOpacity={0.4}
    accessibilityRole="menuitem"
    accessibilityComponentType="button"
    accessibilityTraits="button"
    onPress={onPress}
  >
    <>
      <Icon style={st(styles.icon)} type={icon} />

      <View style={st(styles.wrapper, [position === EMenuItemPosition.FIRST, styles.wrapperFirst])}>
        <View>
          <BodyText style={styles.heading} numberOfLines={1}>
            {heading}
          </BodyText>

          {helperText && (
            <Text style={styles.helperText} numberOfLines={1}>
              {helperText}
            </Text>
          )}
        </View>

        <Icon style={st(styles.arrowIcon)} type={EIconType.RIGHT_ARROW} />
      </View>
    </>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 65,
  },
  wrapper: {
    borderBottomColor: baseSilver,
    borderBottomWidth: 1,

    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  wrapperFirst: {
    borderTopColor: baseSilver,
    borderTopWidth: 1,
  },
  icon: {
    ...spacingStyles.mh4,

    alignSelf: "center",
    color: baseGray,

    width: 24,
    height: 24,
  },
  arrowIcon: {
    ...spacingStyles.mh4,

    color: grayLighter4,
    width: 24,
    height: 24,
  },
  heading: {
    color: grayLighter1,
    lineHeight: 20,
  },
  helperText: {
    color: blueyGray,
    lineHeight: 0,
  },
});

export { MenuItemButton, EMenuItemType, EMenuItemPosition };
export type { TMenuItem };
