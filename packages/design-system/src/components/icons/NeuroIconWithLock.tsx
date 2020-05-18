import * as React from "react";

import { IconWithBadge } from "../..";
import { CommonHtmlProps } from "../../types";

import lockIcon from "../../assets/img/Lock_ICBM.svg";
import neuroIcon from "../../assets/img/nEUR_32.svg";

export const NeuroIconWithLock: React.FunctionComponent<CommonHtmlProps> = ({ className }) => (
  <IconWithBadge icon={neuroIcon} badge={lockIcon} className={className} />
);
