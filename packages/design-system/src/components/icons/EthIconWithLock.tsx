import * as React from "react";

import { IconWithBadge } from "../..";
import { CommonHtmlProps } from "../../types";

import ethIcon from "../../assets/img/ETH_32.svg";
import lockIcon from "../../assets/img/Lock_ICBM.svg";

export const EthIconWithLock: React.FunctionComponent<CommonHtmlProps> = ({ className }) => (
  <IconWithBadge
    icon={ethIcon}
    badge={lockIcon}
    className={className}
    data-test-id="eth-lock-icon"
  />
);
