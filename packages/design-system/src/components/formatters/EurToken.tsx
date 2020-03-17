import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  formatNumber,
  selectDecimalPlaces,
  TDataTestId,
} from "@neufund/shared";
import * as React from "react";

import { Units } from "./atoms/Units";
import { IValueProps, Value } from "./atoms/Value";
import { ICommonMoneyProps } from "./types";

export const EurToken: React.FunctionComponent<IValueProps & ICommonMoneyProps & TDataTestId> = ({
  className,
  value,
  defaultValue,
  roundingMode = ERoundingMode.DOWN,
  inputFormat = ENumberInputFormat.ULPS,
  outputFormat = ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
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
    <span className={className} data-test-id={dataTestId}>
      <Value>{formattedValue || defaultValue || " "}</Value>
      <Units show={!!formattedValue}>nEUR</Units>
    </span>
  );
};
