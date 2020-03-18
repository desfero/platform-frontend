import {
  EAbbreviatedNumberOutputFormat,
  ENumberInputFormat,
  ERoundingMode,
  formatNumber,
  formatShortNumber,
  selectDecimalPlaces,
  TBigNumberVariants,
  THumanReadableFormat,
  TValueFormat,
} from "@neufund/shared";

import { ICommonMoneyProps } from "./types";

interface IFormatCurrency {
  value: TBigNumberVariants;
  valueType: TValueFormat;
  inputFormat: ENumberInputFormat;
  outputFormat: THumanReadableFormat;
  roundingMode: ERoundingMode;
}

export const formatCurrency = ({
  value,
  valueType,
  roundingMode ,
  inputFormat ,
  outputFormat,
}: ICommonMoneyProps & IFormatCurrency): string => {
  const decimalPlaces = selectDecimalPlaces(valueType, outputFormat);

  if (
    outputFormat === EAbbreviatedNumberOutputFormat.SHORT ||
    outputFormat === EAbbreviatedNumberOutputFormat.LONG
  ) {
    return formatShortNumber({
      value,
      roundingMode,
      decimalPlaces,
      inputFormat,
      outputFormat,
      divider: undefined,
    });
  }

  return formatNumber({
    value,
    inputFormat,
    outputFormat,
    roundingMode,
    decimalPlaces,
  });
};
