import { InvariantError } from "@neufund/shared-utils";
import identity from "lodash/fp/identity";
import pickBy from "lodash/fp/pickBy";
import * as React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

import Close from "../../assets/close.svg";
import Device from "../../assets/device.svg";
import Home from "../../assets/home.svg";
import Investments from "../../assets/investments.svg";
import Logout from "../../assets/logout.svg";
import Placeholder from "../../assets/placeholder.svg";
import Profile from "../../assets/profile.svg";
import QrCode from "../../assets/qr-code.svg";
import RightArrow from "../../assets/right-arrow.svg";
import Share from "../../assets/share.svg";
import Eth from "../../assets/tokens/eth.svg";
import NEur from "../../assets/tokens/n-eur.svg";
import Wallet from "../../assets/wallet.svg";
import Yes from "../../assets/yes.svg";

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
  DEVICE = "device",
  LOGOUT = "logout",
}

const pickByIdentity = pickBy(identity);

const icons = {
  [EIconType.CLOSE]: Close,
  [EIconType.DEVICE]: Device,
  [EIconType.ETH]: Eth,
  [EIconType.HOME]: Home,
  [EIconType.PORTFOLIO]: Investments,
  [EIconType.LOGOUT]: Logout,
  [EIconType.N_EUR]: NEur,
  [EIconType.PLACEHOLDER]: Placeholder,
  [EIconType.PROFILE]: Profile,
  [EIconType.QR_CODE]: QrCode,
  [EIconType.RIGHT_ARROW]: RightArrow,
  [EIconType.SHARE]: Share,
  [EIconType.WALLET]: Wallet,
  [EIconType.YES]: Yes,
};

const getIcon = (type: EIconType) => {
  const icon = icons[type];
  if (!icon) {
    throw new InvariantError(`Invalid icon type ${type}`);
  }

  return icon;
};

type TSvgIconProps = React.ComponentProps<ReturnType<typeof getIcon>>;

type TExternalProps = {
  type: EIconType;
  style?: StyleProp<{ color?: string } & ViewStyle>;
} & Omit<TSvgIconProps, "style" | "color" | "width" | "height">;

/**
 * A wrapper component which provides access to our a predefined list of icons by `type` prop
 */
const Icon: React.FunctionComponent<TExternalProps> = ({ type, style, ...props }) => {
  const Component = getIcon(type);

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
