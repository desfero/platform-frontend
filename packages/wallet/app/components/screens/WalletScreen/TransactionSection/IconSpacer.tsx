import React from "react";
import { StyleSheet, View, Animated } from "react-native";

import { spacingStyles } from "../../../../styles/spacings";

export const ICON_SIZE = 24;

const IconSpacer: React.FunctionComponent<React.ComponentProps<typeof View>> = ({
  style,
  ...props
}) => <Animated.View style={[styles.iconSpacer, style]} {...props} />;

const styles = StyleSheet.create({
  iconSpacer: {
    ...spacingStyles.ml4,
    ...spacingStyles.mr3,

    width: ICON_SIZE,
    height: ICON_SIZE,
  },
});

export { IconSpacer };
