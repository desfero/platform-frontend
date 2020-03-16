import {
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  formatNumber,
  THumanReadableFormat,
} from "@neufund/shared";
import * as cn from "classnames";
import * as React from "react";

import { TBigNumberVariants } from "../../../lib/web3/types";

import * as styles from "./FormatNumber.module.scss";

interface IComponentProps {
  value: TBigNumberVariants | undefined | null;
  defaultValue?: React.ReactChild;
  roundingMode?: ERoundingMode;
  decimalPlaces?: number;
  inputFormat: ENumberInputFormat;
  outputFormat: THumanReadableFormat;
  className?: string;
  "data-test-id"?: string;
  decimals?: number;
}

export const FormatNumber: React.FunctionComponent<IComponentProps> = ({
  value,
  defaultValue = "",
  roundingMode = ERoundingMode.DOWN,
  decimalPlaces = 4,
  inputFormat,
  outputFormat = ENumberOutputFormat.FULL,
  className,
  decimals,
  "data-test-id": dataTestId,
}) => {
  if (value) {
    return (
      <span
        className={cn(styles.noBreak, className)}
        data-test-id={dataTestId ? dataTestId : "value"}
      >
        {formatNumber({ value, inputFormat, outputFormat, roundingMode, decimalPlaces, decimals })}
      </span>
    );
  } else {
    return <span data-test-id="value">{defaultValue}</span>;
  }
};
