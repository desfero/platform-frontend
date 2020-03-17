import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  formatNumber,
  selectDecimalPlaces,
} from "@neufund/shared";
import * as React from "react";

import { IMoneyProps, Money } from "./Money";
import { ICommonMoneyProps } from "./types";

export const Eur: React.FunctionComponent<IMoneyProps & ICommonMoneyProps> = ({
  className,
  value,
  defaultValue,
  roundingMode = ERoundingMode.DOWN,
  inputFormat = ENumberInputFormat.ULPS,
  outputFormat = ENumberOutputFormat.FULL,
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
      {formattedValue || defaultValue || " "} EUR
    </Money>
  );
};
