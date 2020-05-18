import * as React from "react";

import { CommonHtmlProps } from "../../types";
import { IconWithBadge, } from "../..";

import ethIcon from "../../assets/img/ETH_32.svg"
import tokenIcon from "../../assets/img/token_icon.svg"

export const EthIconWithLock: React.FunctionComponent<CommonHtmlProps> = ({
  className,
}) =>
  <IconWithBadge icon={ethIcon} badge={tokenIcon} className={className} />
