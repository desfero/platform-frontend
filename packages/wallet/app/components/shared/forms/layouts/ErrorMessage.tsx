import * as React from "react";
import { StyleSheet, Text } from "react-native";

import { HelperText } from "components/shared/typography/HelperText";

import { baseRed } from "styles/colors";

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
