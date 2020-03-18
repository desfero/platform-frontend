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

export const Neu: React.FunctionComponent<IValueProps & ICommonMoneyProps & TDataTestId> = ({
  className,
  value,
  defaultValue,
  inputFormat = ENumberInputFormat.ULPS,
  outputFormat = ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
  roundingMode = ERoundingMode.DOWN,
  "data-test-id": dataTestId,
}) => {
  const formattedValue =
    value &&
    formatCurrency({
      value,
      valueType: ECurrency.NEU,
      inputFormat: inputFormat,
      outputFormat: outputFormat,
      roundingMode: roundingMode,
    });

  return (
    <span className={className} data-test-id={dataTestId}>
      <Value>{formattedValue || defaultValue || " "}</Value>
      <Units show={!!formattedValue}>NEU</Units>
    </span>
  );
};
