import {
  DEFAULT_DECIMAL_PLACES,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  formatNumber,
  TBigNumberVariants,
} from "@neufund/shared";
import * as React from "react";

interface INeuProps {
  defaultValue?: TBigNumberVariants | null | undefined;
  value: TBigNumberVariants | null | undefined;
  outputFormat?: ENumberOutputFormat;
}

export const Neu: React.FunctionComponent<INeuProps> = ({ value, defaultValue, outputFormat }) => {
  const formattedValue =
    value &&
    formatNumber({
      value,
      inputFormat: ENumberInputFormat.ULPS,
      outputFormat: outputFormat || ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
      roundingMode: ERoundingMode.DOWN,
      decimalPlaces: DEFAULT_DECIMAL_PLACES,
    });

  return <span>{formattedValue || defaultValue || " "} NEU</span>;
};
