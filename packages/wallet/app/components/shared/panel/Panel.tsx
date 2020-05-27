import React from "react";
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

import { baseWhite } from "styles/colors";
import { roundness, shadowStyles } from "styles/common";
import { spacingStyles } from "styles/spacings";

type TExternalProps = {
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const PanelTouchable: React.FunctionComponent<
  TExternalProps & React.ComponentProps<typeof TouchableOpacity>
> = ({ style, children, contentContainerStyle, ...props }) => (
  <TouchableOpacity
    activeOpacity={0.6}
    accessibilityComponentType="button"
    accessibilityTraits="button"
    style={[styles.wrapper, style]}
    {...props}
  >
    <View style={[styles.innerWrapper, contentContainerStyle]}>{children}</View>
  </TouchableOpacity>
);

const Panel: React.FunctionComponent<TExternalProps & React.ComponentProps<typeof View>> = ({
  style,
  children,
  contentContainerStyle,
  ...props
}) => (
  <View style={[styles.wrapper, style]} {...props}>
    <View style={[styles.innerWrapper, contentContainerStyle]}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    ...shadowStyles.s2,

    borderRadius: roundness,
    backgroundColor: baseWhite,
  },
  innerWrapper: {
    ...spacingStyles.p4,

    overflow: "hidden",
  },
});

export { PanelTouchable, Panel };
