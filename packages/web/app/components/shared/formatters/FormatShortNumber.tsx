import {
  EAbbreviatedNumberOutputFormat,
  ENumberInputFormat,
  ERoundingMode,
  THumanReadableFormat,
  toFixedPrecision,
} from "@neufund/shared";
import { ceil, findLast, floor, round } from "lodash";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TBigNumberVariants } from "../../../lib/web3/types";
import { TTranslatedString } from "../../../types";

enum ERangeKey {
  THOUSAND = "thousand",
  MILLION = "million",
}

type TRangeDescriptor = {
  divider: number;
  key: ERangeKey;
};

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

const ranges: TRangeDescriptor[] = [
  { divider: 1e3, key: ERangeKey.THOUSAND },
  { divider: 1e6, key: ERangeKey.MILLION },
];

export const translationKeys = {
  [ERangeKey.MILLION]: {
    [EAbbreviatedNumberOutputFormat.LONG]: (
      <FormattedMessage id="shared-component.to-human-readable-form.million.long" />
    ),
    [EAbbreviatedNumberOutputFormat.SHORT]: (
      <FormattedMessage id="shared-component.to-human-readable-form.million.short" />
    ),
  },
  [ERangeKey.THOUSAND]: {
    [EAbbreviatedNumberOutputFormat.LONG]: (
      <FormattedMessage id="shared-component.to-human-readable-form.thousand.long" />
    ),
    [EAbbreviatedNumberOutputFormat.SHORT]: (
      <FormattedMessage id="shared-component.to-human-readable-form.thousand.short" />
    ),
  },
};

export function getRange(number: number, divider?: number): TRangeDescriptor | undefined {
  if (divider) {
    return ranges.find(range => range.divider === divider);
  }

  return findLast(ranges, range => number / range.divider >= 1);
}

export const getShortNumberRoundingFn = (roundingMode: ERoundingMode) => {
  switch (roundingMode) {
    case ERoundingMode.DOWN:
      return floor;
    case ERoundingMode.UP:
      return ceil;
    case ERoundingMode.HALF_UP:
    case ERoundingMode.HALF_DOWN:
    default:
      return round;
  }
};

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
  const number = parseFloat(
    toFixedPrecision({ value, roundingMode, inputFormat, decimalPlaces, outputFormat, decimals }),
  );
  const range = getRange(number, divider);
  if (range) {
    const roundingFn = getShortNumberRoundingFn(roundingMode);
    const shortValue = roundingFn(number / range.divider, 1).toString();

    const translation = (translationKeys[range.key] as {
      [key in THumanReadableFormat]: TTranslatedString;
    })[outputFormat];

    return (
      <span className={className} data-test-id="value">
        {shortValue}
        {outputFormat === EAbbreviatedNumberOutputFormat.LONG && " "}
        {translation}
      </span>
    );
  } else {
    return (
      <span className={className} data-test-id="value">
        {number.toString()}
      </span>
    );
  }
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
