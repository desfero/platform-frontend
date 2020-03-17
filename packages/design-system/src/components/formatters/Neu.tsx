import {
  DEFAULT_DECIMAL_PLACES,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  formatNumber,
  selectDecimalPlaces,
  ECurrency,
} from "@neufund/shared";
import * as React from "react";
import { IMoneyProps, Money } from "./Money";
import { ICommonMoneyProps } from "./types";

export const Neu: React.FunctionComponent<IMoneyProps & ICommonMoneyProps> = ({
  className,
  value,
  defaultValue,
  inputFormat = ENumberInputFormat.ULPS,
  outputFormat = ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
  roundingMode = ERoundingMode.DOWN,
  "data-test-id": dataTestId,
}) => {
  const decimalPlaces = selectDecimalPlaces(ECurrency.EUR, outputFormat);

  const formattedValue =
    value &&
    formatNumber({
      value,
      inputFormat: inputFormat,
      outputFormat: outputFormat,
      roundingMode: roundingMode,
      decimalPlaces,
    });

  return (
    <Money className={className} data-test-id={dataTestId}>
      {formattedValue || defaultValue || " "} NEU
    </Money>
  );
};
