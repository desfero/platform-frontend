import React from "react";
import { GestureResponderEvent, StyleSheet, TouchableOpacity, View } from "react-native";

import {
  baseGray,
  baseSilver,
  blueyGray,
  grayLighter1,
  grayLighter4,
} from "../../../styles/colors";
import { spacingStyles } from "../../../styles/spacings";
import { st } from "../../utils";
import { EIconType, Icon } from "../Icon";
import { BodyText } from "../typography/BodyText";
import { Text } from "../typography/Text";

type TMenuItem = {
  id: string;
  onPress: (event: GestureResponderEvent) => void;
  icon: EIconType;
  heading: string;
  helperText?: string;
};

const MenuItemNavigation: React.FunctionComponent<TMenuItem> = ({
  heading,
  helperText,
  icon,
  onPress,
}) => (
  <TouchableOpacity
    style={st(styles.container)}
    activeOpacity={0.4}
    accessibilityComponentType="button"
    accessibilityTraits="button"
    onPress={onPress}
  >
    <>
      <Icon style={st(styles.icon)} type={icon} />

      <View style={st(styles.wrapper)}>
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
    lineHeight: 16,
  },
});

export { MenuItemNavigation };
