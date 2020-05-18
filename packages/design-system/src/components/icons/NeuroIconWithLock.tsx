import * as React from "react";

import { CommonHtmlProps } from "../../types";
import { IconWithBadge, } from "../..";

import neuroIcon from "../../assets/img/nEUR_32.svg"
import lockIcon from "../../assets/img/Lock_ICBM.svg"

export const NeuroIconWithLock: React.FunctionComponent<CommonHtmlProps> = ({
  className,
}) =>
  <IconWithBadge icon={neuroIcon} badge={lockIcon} className={className} />
