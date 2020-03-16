import {
  assertNever,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  ESpecialNumber,
  formatNumber,
  THumanReadableFormat,
} from "@neufund/shared";
import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TBigNumberVariants } from "../../../lib/web3/types";
import { TTranslatedString } from "../../../types";

import * as styles from "./FormatNumber.module.scss";

interface INumberRangeProps {
  valueFrom: TBigNumberVariants | undefined | null;
  valueUpto: TBigNumberVariants | undefined | null | ESpecialNumber;
  defaultValue?: React.ReactChild;
  decimalPlaces?: number;
  inputFormat: ENumberInputFormat;
  outputFormat: THumanReadableFormat;
  isPrice?: boolean;
  roundingMode?: ERoundingMode;
  separator?: string;
  className?: string;
}

const getSpecialNumberTranslation = (value: ESpecialNumber): TTranslatedString => {
  switch (value) {
    case ESpecialNumber.UNLIMITED: {
      return <FormattedMessage id="common.number-quantity.unlimited" />;
    }
    default:
      return assertNever(value);
  }
};

export const FormatNumberRange: React.FunctionComponent<INumberRangeProps> = ({
  valueFrom,
  valueUpto,
  defaultValue = "",
  roundingMode = ERoundingMode.UP,
  decimalPlaces = 4,
  inputFormat = ENumberInputFormat.FLOAT,
  outputFormat = ENumberOutputFormat.FULL,
  isPrice = false,
  separator = "–", //todo nowrap before (?)
  className,
}) => {
  if (valueFrom && valueUpto) {
    const renderValueFrom = formatNumber({
      value: valueFrom,
      roundingMode,
      decimalPlaces,
      inputFormat,
      isPrice,
      outputFormat,
    });

    if (
      typeof valueUpto === "string" &&
      Object.values(ESpecialNumber).includes(valueUpto as ESpecialNumber)
      // TODO: Figure out why is this assertion like this
    ) {
      return (
        <span className={cn(styles.noBreak, className)} data-test-id="value">
          {renderValueFrom}
          {separator}
          {getSpecialNumberTranslation(valueUpto as ESpecialNumber)}
        </span>
      );
    } else {
      return (
        <span className={cn(styles.noBreak, className)} data-test-id="value">
          {renderValueFrom}
          {separator}
          {formatNumber({
            value: valueUpto,
            roundingMode,
            decimalPlaces,
            inputFormat,
            outputFormat,
            isPrice,
          })}
        </span>
      );
    }
  } else {
    return <span data-test-id="value">{defaultValue}</span>;
  }
};
