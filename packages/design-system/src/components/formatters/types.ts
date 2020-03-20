import {
  ENumberInputFormat,
  ERoundingMode,
  TBigNumberVariants,
  THumanReadableFormat,
} from "@neufund/shared";
import * as React from "react";

export interface ICommonMoneyProps {
  defaultValue?: React.ReactChild;
  value: TBigNumberVariants | null | undefined;
  inputFormat?: ENumberInputFormat;
  outputFormat?: THumanReadableFormat;
  roundingMode?: ERoundingMode;
}

export interface ICommonFormatterProps {
  defaultValue?: React.ReactChild;
  value: TBigNumberVariants | null | undefined;
}
