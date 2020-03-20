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
import { ICommonFormatterProps } from "./types";
import { formatCurrency } from "./utils";

export const EurTokenFull: React.FunctionComponent<IValueProps &
  ICommonFormatterProps &
  TDataTestId> = ({ className, value, defaultValue, "data-test-id": dataTestId }) => {
  const formattedValue =
    value &&
    formatCurrency({
      value,
      valueType: ECurrency.EUR_TOKEN,
      inputFormat: ENumberInputFormat.ULPS,
      outputFormat: ENumberOutputFormat.FULL,
      roundingMode: ERoundingMode.DOWN,
    });

  return (
    <span className={className} data-test-id={dataTestId}>
      <Value>{formattedValue || defaultValue || " "}</Value>
      <Units show={!!formattedValue}>nEUR</Units>
    </span>
  );
};
