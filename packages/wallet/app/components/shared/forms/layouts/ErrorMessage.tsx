import * as React from "react";
import { StyleSheet, Text } from "react-native";

import { baseRed } from "../../../../styles/colors";
import { HelperText } from "../../typography/HelperText";

type TExternalProps = React.ComponentProps<typeof Text>;

/**
 * An input error message component that aligns with our design system
 */
const ErrorMessage: React.FunctionComponent<TExternalProps> = ({ style, ...props }) => (
  <HelperText style={[styles.errorMessage, style]} {...props} />
);

const styles = StyleSheet.create({
  errorMessage: {
    color: baseRed,
  },
});

export { ErrorMessage };
