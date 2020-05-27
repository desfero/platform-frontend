import identity from "lodash/fp/identity";
import pickBy from "lodash/fp/pickBy";
import * as React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

import Close from "assets/close.svg";
import Home from "assets/home.svg";
import Investments from "assets/investments.svg";
import Pending from "assets/pending.svg";
import Placeholder from "assets/placeholder.svg";
import Profile from "assets/profile.svg";
import QrCode from "assets/qr-code.svg";
import RightArrow from "assets/right-arrow.svg";
import Share from "assets/share.svg";
import Eth from "assets/tokens/eth.svg";
import NEur from "assets/tokens/n-eur.svg";
import Wallet from "assets/wallet.svg";
import Yes from "assets/yes.svg";

enum EIconType {
  HOME = "home",
  PORTFOLIO = "portf",
  PROFILE = "profile",
  SHARE = "share",
  WALLET = "wallet",
  CLOSE = "close",
  PLACEHOLDER = "placeholder",
  RIGHT_ARROW = "right-arrow",
  YES = "yes",
  N_EUR = "n-eur",
  ETH = "eth",
  QR_CODE = "qr-code",
  PENDING = "pending",
}

const pickByIdentity = pickBy(identity);

const icons: Record<EIconType, typeof Close> = {
  [EIconType.CLOSE]: Close,
  [EIconType.ETH]: Eth,
  [EIconType.HOME]: Home,
  [EIconType.N_EUR]: NEur,
  [EIconType.PENDING]: Pending,
  [EIconType.PLACEHOLDER]: Placeholder,
  [EIconType.PORTFOLIO]: Investments,
  [EIconType.PROFILE]: Profile,
  [EIconType.QR_CODE]: QrCode,
  [EIconType.RIGHT_ARROW]: RightArrow,
  [EIconType.SHARE]: Share,
  [EIconType.WALLET]: Wallet,
  [EIconType.YES]: Yes,
};

type TSvgIconProps = React.ComponentProps<typeof Close>;

type TExternalProps = {
  type: EIconType;
  style?: StyleProp<{ color?: string } & ViewStyle>;
} & Omit<TSvgIconProps, "style" | "color" | "width" | "height">;

/**
 * A wrapper component which provides access to our a predefined list of icons by `type` prop
 */
const Icon: React.FunctionComponent<TExternalProps> = ({ type, style, ...props }) => {
  const Component = icons[type];

  // extract color from styles so all styles are consistently provided though styles
  const { color, width, height, ...styleWithoutColor } = StyleSheet.flatten(style);

  const customProps = pickByIdentity({
    width,
    height,
    color,
  });

  return <Component {...props} {...customProps} style={styleWithoutColor} />;
};

export { Icon, EIconType };
