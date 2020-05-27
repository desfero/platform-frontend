import * as React from "react";
import { StyleSheet, Image } from "react-native";

import { Icon } from "components/shared/Icon";

type TImageProps = React.ComponentProps<typeof Image>;
type TIconProps = React.ComponentProps<typeof Icon>;

const TOKEN_ICON_SIZE = 32;

/**
 * A wrapper component which provides access to an externally provided token icons
 */
const TokenImage: React.FunctionComponent<TImageProps> = ({ style, ...props }) => {
  return <Image {...props} style={[styles.tokenIcon, style]} accessibilityIgnoresInvertColors />;
};

/**
 * A wrapper component which provides access to an externally provided token icons
 */
const TokenIcon: React.FunctionComponent<TIconProps> = ({ style, ...props }) => {
  return <Icon {...props} style={[styles.tokenIcon, style]} accessibilityIgnoresInvertColors />;
};

const styles = StyleSheet.create({
  tokenIcon: {
    width: TOKEN_ICON_SIZE,
    height: TOKEN_ICON_SIZE,
    borderRadius: TOKEN_ICON_SIZE / 2,
    resizeMode: "contain",
  },
});

export { TokenIcon, TokenImage };
