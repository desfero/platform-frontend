import * as React from "react";
import { StyleSheet } from "react-native";

import { baseGray } from "../../../../styles/colors";
import { BodyBoldText } from "../../typography/BodyText";

type TExternalProps = React.ComponentProps<typeof BodyBoldText>;

/**
 * An label component that aligns with our design system
 */
const Label: React.FunctionComponent<TExternalProps> = ({ style, ...props }) => (
  <BodyBoldText style={[styles.label, style]} {...props} />
);

const styles = StyleSheet.create({
  label: {
    color: baseGray,
  },
});

export { Label };
