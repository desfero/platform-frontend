import React from "react";
import { StyleSheet } from "react-native";

import { NeuLinearGradient } from "./NeuLinearGradient";
import { EStatusBarStyle, Screen } from "./Screen";

type TExternalProps = React.ComponentProps<typeof Screen>;

const NeuGradientScreen: React.FunctionComponent<TExternalProps> = ({
  children,
  style,
  contentContainerStyle,
  ...props
}) => (
  <Screen statusBarStyle={EStatusBarStyle.DARK_BLUEY_GRAY} {...props}>
    <NeuLinearGradient style={[styles.gradient, contentContainerStyle, style]}>
      {children}
    </NeuLinearGradient>
  </Screen>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export { NeuGradientScreen };
