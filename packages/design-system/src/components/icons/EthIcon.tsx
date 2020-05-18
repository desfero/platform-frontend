import * as React from "react";

import { TokenIcon } from "./TokenIcon";
import { CommonHtmlProps } from "../../types";

import ethIcon from "../../assets/img/ETH_32.svg"

export const EthIcon:React.FunctionComponent<CommonHtmlProps> = ({
  className
}) =>
  <TokenIcon srcSet={{ "1x": ethIcon }} alt="" className={className} />
