import * as React from "react";

import { CommonHtmlProps } from "../../types";
import { IconWithBadge, } from "../..";

import neuroIcon from "../../assets/img/nEUR_32.svg"
import tokenIcon from "../../assets/img/token_icon.svg"

export const NeuroIconWithLock: React.FunctionComponent<CommonHtmlProps> = ({
  className,
}) =>
  <IconWithBadge icon={neuroIcon} badge={tokenIcon} className={className} />
