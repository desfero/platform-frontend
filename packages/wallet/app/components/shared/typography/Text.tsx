import React from "react";
import { Text as NativeText } from "react-native";

import { typographyStyles } from "styles/typography";

type TExternalProps = React.ComponentProps<typeof NativeText>;

const Text: React.FunctionComponent<TExternalProps> = ({ children, style, ...props }) => (
  <NativeText style={[typographyStyles.text, style]} {...props}>
    {children}
  </NativeText>
);

const TextBold: React.FunctionComponent<TExternalProps> = ({ children, style, ...props }) => (
  <NativeText style={[typographyStyles.textBold, style]} {...props}>
    {children}
  </NativeText>
);

export { Text, TextBold };
