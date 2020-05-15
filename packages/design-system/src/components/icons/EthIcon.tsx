import * as React from "react";

import { TokenIcon } from "./TokenIcon";
import { CommonHtmlProps } from "../../types";

import eth_icon from "../../assets/img/ETH_32.svg"

export const EthIcon:React.FunctionComponent<CommonHtmlProps> = ({
  className
}) =>
  <TokenIcon srcSet={{ "1x": eth_icon }} alt="" className={className} />
