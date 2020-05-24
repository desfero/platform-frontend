import * as React from "react";
import { Animated, StyleSheet } from "react-native";

type TExternalProps = React.ComponentProps<typeof Animated.Text>;

const BoldText: React.FunctionComponent<TExternalProps> = ({ children, style, ...props }) => {
  return (
    <Animated.Text style={[styles.bold, style]} {...props}>
      {children}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: "bold",
  },
});

export { BoldText };
