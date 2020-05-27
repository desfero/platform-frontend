import * as React from "react";
import { StyleSheet, Text } from "react-native";

import { blueyGray } from "styles/colors";
import { typographyStyles } from "styles/typography";

type TExternalProps = React.ComponentProps<typeof Text>;

/**
 * An input help text component that aligns with our design system
 * Use when there is a need to provide additional information that will help filling properly input value
 */
const HelperText: React.FunctionComponent<TExternalProps> = ({ style, ...props }) => (
  <Text style={[styles.helperText, style]} {...props} />
);

const styles = StyleSheet.create({
  helperText: {
    ...typographyStyles.helperText,
    color: blueyGray,
  },
});

export { HelperText };
