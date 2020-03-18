import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  TDataTestId,
} from "@neufund/shared";
import * as React from "react";

import { Units } from "./atoms/Units";
import { IValueProps, Value } from "./atoms/Value";
import { ICommonMoneyProps } from "./types";
import { formatCurrency } from "./utils";

export const Eur: React.FunctionComponent<IValueProps & ICommonMoneyProps & TDataTestId> = ({
  className,
  value,
  defaultValue,
  roundingMode = ERoundingMode.DOWN,
  inputFormat = ENumberInputFormat.ULPS,
  outputFormat = ENumberOutputFormat.FULL,
  "data-test-id": dataTestId,
}) => {
  const formattedValue =
    value &&
    formatCurrency({
      value,
      valueType: ECurrency.EUR,
      inputFormat: inputFormat,
      outputFormat: outputFormat,
      roundingMode: roundingMode,
    });

  return (
    <span className={className} data-test-id={dataTestId}>
      <Value>{formattedValue || defaultValue || " "}</Value>
      <Units show={!!formattedValue}>EUR</Units>
    </span>
  );
};
