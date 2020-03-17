import {
  DEFAULT_DECIMAL_PLACES,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  formatNumber,
  TBigNumberVariants,
} from "@neufund/shared";
import * as React from "react";

import { IMoneyProps, Money } from "./Money";

interface INeuProps {
  defaultValue?: TBigNumberVariants | null | undefined;
  value: TBigNumberVariants | null | undefined;
  outputFormat?: ENumberOutputFormat;
  roundingMode?: ERoundingMode;
}

export const Eth: React.FunctionComponent<IMoneyProps & INeuProps> = ({
  className,
  value,
  defaultValue,
  roundingMode,
  outputFormat,
}) => {
  const formattedValue =
    value &&
    formatNumber({
      value,
      inputFormat: ENumberInputFormat.ULPS,
      outputFormat: outputFormat || ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
      roundingMode: roundingMode || ERoundingMode.DOWN,
      decimalPlaces: DEFAULT_DECIMAL_PLACES,
    });

  return <Money className={className}>{formattedValue || defaultValue || " "} ETH</Money>;
};
