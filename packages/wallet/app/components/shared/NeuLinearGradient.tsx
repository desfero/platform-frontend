import React from "react";
import LinearGradient from "react-native-linear-gradient";

import { useTheme } from "../../themes/ThemeProvider";

type TExternalProps = Omit<
  React.ComponentProps<typeof LinearGradient>,
  "colors" | "useAngle" | "angleCenter"
>;

/**
 * A neufund style linear gradient used across components
 */
const NeuLinearGradient: React.FunctionComponent<TExternalProps> = ({ angle, ...props }) => {
  const { colors } = useTheme();

  return (
    <LinearGradient
      angle={angle}
      useAngle={!!angle}
      angleCenter={angle ? { x: 0.5, y: 0.5 } : undefined}
      colors={[colors.accent.blueGrayDarker, colors.accent.blueGrayDarker2]}
      {...props}
    />
  );
};

export { NeuLinearGradient };
