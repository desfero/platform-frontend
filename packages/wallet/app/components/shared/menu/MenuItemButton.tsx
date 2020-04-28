import React from "react";
import { GestureResponderEvent, StyleSheet, TouchableOpacity, View } from "react-native";

import { baseGray, baseSilver, grayLighter1 } from "../../../styles/colors";
import { spacingStyles } from "../../../styles/spacings";
import { st } from "../../utils";
import { EIconType, Icon } from "../Icon";
import { BodyText } from "../typography/BodyText";

type TMenuItem = {
  id: string;
  onPress: (event: GestureResponderEvent) => void;
  icon: EIconType;
  heading: string;
  color?: string;
};

const MenuItemButton: React.FunctionComponent<TMenuItem> = ({ heading, icon, onPress, color }) => (
  <TouchableOpacity
    style={st(styles.container)}
    activeOpacity={0.4}
    accessibilityComponentType="button"
    accessibilityTraits="button"
    onPress={onPress}
  >
    <>
      <Icon style={st(styles.icon, [color, { color }])} type={icon} />

      <View style={st(styles.wrapper)}>
        <BodyText style={st(styles.heading, [color, { color }])} numberOfLines={1}>
          {heading}
        </BodyText>
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
    borderTopColor: baseSilver,
    borderTopWidth: 1,

    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  icon: {
    ...spacingStyles.mh4,

    alignSelf: "center",
    color: baseGray,

    width: 24,
    height: 24,
  },
  heading: {
    color: grayLighter1,
    lineHeight: 20,
  },
});

export { MenuItemButton };
