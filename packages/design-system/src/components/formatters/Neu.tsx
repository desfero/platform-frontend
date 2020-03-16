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

export const Neu = ({ value, defaultValue, outputFormat }): React.FunctionComponent<INeuProps> => {
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
