import React from "react";
import { Text as NativeText } from "react-native";

import { typographyStyles } from "../../../styles/typography";

type TExternalProps = React.ComponentProps<typeof NativeText>;

const MenuLabel: React.FunctionComponent<TExternalProps> = ({ children, style, ...props }) => (
  <NativeText style={[typographyStyles.menuLabel, style]} {...props}>
    {children}
  </NativeText>
);

const MenuLabelBold: React.FunctionComponent<TExternalProps> = ({ children, style, ...props }) => (
  <NativeText style={[typographyStyles.menuLabelBold, style]} {...props}>
    {children}
  </NativeText>
);

export { MenuLabel, MenuLabelBold };
