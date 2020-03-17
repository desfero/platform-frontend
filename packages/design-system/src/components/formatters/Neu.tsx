import {
  DEFAULT_DECIMAL_PLACES,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  formatNumber,
} from "@neufund/shared";
import * as React from "react";
import { IMoneyProps, Money } from "./Money";
import { ICommonMoneyProps } from "./types";

export const Neu: React.FunctionComponent<IMoneyProps & ICommonMoneyProps> = ({
  className,
  value,
  defaultValue,
  inputFormat,
  outputFormat,
  roundingMode,
  "data-test-id": dataTestId,
}) => {
  const formattedValue =
    value &&
    formatNumber({
      value,
      inputFormat: inputFormat || ENumberInputFormat.ULPS,
      outputFormat: outputFormat || ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
      roundingMode: roundingMode || ERoundingMode.DOWN,
      decimalPlaces: DEFAULT_DECIMAL_PLACES,
    });

  return (
    <Money className={className} data-test-id={dataTestId}>
      {formattedValue || defaultValue || " "} NEU
    </Money>
  );
};
