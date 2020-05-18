import * as React from "react";

import { CommonHtmlProps } from "../../types";
import { IconWithBadge, } from "../..";

import ethIcon from "../../assets/img/ETH_32.svg"
import lockIcon from "../../assets/img/Lock_ICBM.svg"

export const EthIconWithLock: React.FunctionComponent<CommonHtmlProps> = ({
  className,
}) =>
  <IconWithBadge icon={ethIcon} badge={lockIcon} className={className} />
