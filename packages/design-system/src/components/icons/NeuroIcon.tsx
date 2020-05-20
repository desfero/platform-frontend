import * as React from "react";

import { CommonHtmlProps } from "../../types";
import { TokenIcon } from "./TokenIcon";

import neuroIcon from "../../assets/img/nEUR_32.svg";

export const NeuroIcon: React.FunctionComponent<CommonHtmlProps> = ({ className }) => (
  <TokenIcon srcSet={{ "1x": neuroIcon }} alt="" className={className} data-test-id="neuro-icon"/>
);
