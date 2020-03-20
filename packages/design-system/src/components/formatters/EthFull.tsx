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

export const EthFull: React.FunctionComponent<IValueProps &
  ICommonFormatterProps &
  TDataTestId> = ({ className, value, defaultValue, "data-test-id": dataTestId }) => {
  const formattedValue =
    value &&
    formatCurrency({
      value,
      valueType: ECurrency.ETH,
      inputFormat: ENumberInputFormat.ULPS,
      outputFormat: ENumberOutputFormat.FULL,
      roundingMode: ERoundingMode.DOWN,
    });

  return (
    <span data-test-id={dataTestId}>
      <Value className={className}>{formattedValue || defaultValue || " "}</Value>
      <Units show={!!formattedValue}>ETH</Units>
    </span>
  );
};
