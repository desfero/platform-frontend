import {
  EAbbreviatedNumberOutputFormat,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  ESpecialNumber,
  selectDecimalPlaces,
  selectUnits,
} from "@neufund/shared";
import * as cn from "classnames";
import * as React from "react";

import { TBigNumberVariants } from "../../../lib/web3/types";
import { CommonHtmlProps, TDataTestId } from "../../../types";
import { FormatNumberRange } from "./FormatNumberRange";
import { FormatShortNumberRange } from "./FormatShortNumber";
import { ECurrencySymbol, IMoneyCommonProps } from "./Money";

import * as styles from "./Money.module.scss";

interface IMoneyRangeProps {
  valueFrom: TBigNumberVariants | null | undefined;
  valueUpto: TBigNumberVariants | null | undefined | ESpecialNumber;
  separator?: string;
}

export const MoneyRange: React.FunctionComponent<IMoneyRangeProps &
  IMoneyCommonProps &
  CommonHtmlProps &
  TDataTestId> = ({
  valueFrom,
  valueUpto,
  inputFormat = ENumberInputFormat.ULPS,
  outputFormat = ENumberOutputFormat.FULL,
  valueType,
  currencySymbol = ECurrencySymbol.CODE,
  defaultValue = "-",
  separator = "–",
  currencyClassName,
  transfer,
  theme,
  className,
  ["data-test-id"]: dataTestId,
}) => {
  let formattedValue = null;

  if (valueFrom && valueUpto) {
    //todo should pass through 0 but not invalid vals
    if (
      outputFormat === EAbbreviatedNumberOutputFormat.LONG ||
      outputFormat === EAbbreviatedNumberOutputFormat.SHORT
    ) {
      formattedValue = (
        <FormatShortNumberRange
          valueFrom={valueFrom}
          valueUpto={valueUpto}
          inputFormat={inputFormat}
          outputFormat={outputFormat}
          decimalPlaces={selectDecimalPlaces(valueType, outputFormat)}
          roundingMode={ERoundingMode.DOWN}
          separator={separator}
        />
      );
    } else if (
      outputFormat === ENumberOutputFormat.FULL_ROUND_UP ||
      outputFormat === ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP
    ) {
      formattedValue = (
        <FormatNumberRange
          valueFrom={valueFrom}
          valueUpto={valueUpto}
          inputFormat={inputFormat}
          outputFormat={outputFormat}
          decimalPlaces={selectDecimalPlaces(valueType, outputFormat)}
          roundingMode={ERoundingMode.UP}
          separator={separator}
        />
      );
    } else {
      formattedValue = (
        <FormatNumberRange
          valueFrom={valueFrom}
          valueUpto={valueUpto}
          inputFormat={inputFormat}
          outputFormat={outputFormat}
          decimalPlaces={selectDecimalPlaces(valueType, outputFormat)}
          roundingMode={ERoundingMode.DOWN}
          separator={separator}
        />
      );
    }
  }

  return (
    <span className={cn(styles.money, transfer, className, theme)} data-test-id={dataTestId}>
      <span className={cn(styles.value)}>{formattedValue || defaultValue}</span>
      {formattedValue && currencySymbol === ECurrencySymbol.CODE && (
        <span className={cn(styles.currency, currencyClassName)} data-test-id="units">
          {" "}
          {selectUnits(valueType)}
        </span>
      )}
    </span>
  );
};
