import {
  EAbbreviatedNumberOutputFormat,
  ENumberInputFormat,
  ERoundingMode,
  formatShortNumber,
} from "@neufund/shared";
import * as React from "react";

import { TBigNumberVariants } from "../../../lib/web3/types";

interface IProps {
  value: TBigNumberVariants | undefined | null;
  outputFormat: EAbbreviatedNumberOutputFormat;
  inputFormat: ENumberInputFormat;
  decimalPlaces?: number;
  divider?: number;
  defaultValue?: React.ReactChild;
  roundingMode?: ERoundingMode;
  className?: string;
  decimals?: number;
}

interface IRangeProps {
  valueFrom: TBigNumberVariants | undefined | null;
  valueUpto: TBigNumberVariants | undefined | null;
  outputFormat: EAbbreviatedNumberOutputFormat;
  inputFormat: ENumberInputFormat;
  decimalPlaces?: number;
  divider?: number;
  defaultValue?: string;
  roundingMode?: ERoundingMode;
  className?: string;
  isPrice?: boolean;
  separator?: string;
}

const FormatShortNumber: React.FunctionComponent<IProps> = ({
  value,
  defaultValue = "",
  roundingMode = ERoundingMode.HALF_UP,
  decimalPlaces = 4,
  inputFormat = ENumberInputFormat.FLOAT,
  outputFormat = EAbbreviatedNumberOutputFormat.LONG,
  className,
  divider,
  decimals,
}) => {
  if (!value) {
    return (
      <span className={className} data-test-id="value">
        {defaultValue}
      </span>
    );
  }

  return (
    <span className={className} data-test-id="value">
      {formatShortNumber({
        value,
        roundingMode,
        decimalPlaces,
        inputFormat,
        outputFormat,
        className,
        divider,
        decimals,
      })}
    </span>
  );
};

export const FormatShortNumberRange: React.FunctionComponent<IRangeProps> = ({
  valueFrom,
  valueUpto,
  defaultValue = "",
  roundingMode = ERoundingMode.UP,
  decimalPlaces = 4,
  outputFormat = EAbbreviatedNumberOutputFormat.LONG,
  inputFormat = ENumberInputFormat.FLOAT,
  className,
  divider,
  separator = "—",
}) => {
  if (valueFrom && valueUpto) {
    return (
      //todo 1.nowrap before ndash 2. let user choose if it's a span or a <> (?)
      // todo add unlimited
      <span className={className}>
        <FormatShortNumber
          value={valueFrom}
          outputFormat={outputFormat}
          divider={divider}
          decimalPlaces={decimalPlaces}
          roundingMode={roundingMode}
          inputFormat={inputFormat}
        />
        {outputFormat === EAbbreviatedNumberOutputFormat.LONG && " "}
        {separator}
        {outputFormat === EAbbreviatedNumberOutputFormat.LONG && " "}
        <FormatShortNumber
          value={valueUpto}
          outputFormat={outputFormat}
          divider={divider}
          decimalPlaces={decimalPlaces}
          roundingMode={roundingMode}
          inputFormat={inputFormat}
        />
      </span>
    );
  } else {
    return <>{defaultValue}</>;
  }
};

export { FormatShortNumber };
