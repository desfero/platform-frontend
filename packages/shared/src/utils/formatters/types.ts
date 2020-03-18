import { EquityToken } from "../opaque-types/types";
import { TBigNumberVariants } from "../types";

export enum ERoundingMode {
  UP = "up",
  DOWN = "down",
  HALF_UP = "half_up",
  HALF_DOWN = "half_down",
}

export enum ENumberInputFormat {
  ULPS = "ulps",
  FLOAT = "float",
}

export enum ECurrency {
  NEU = "neu",
  EUR = "eur",
  EUR_TOKEN = "eur_t",
  ETH = "eth",
}

export enum ENumberFormat {
  PERCENTAGE = "percentage",
}

export enum EPriceFormat {
  EQUITY_TOKEN_PRICE_ETH = "equityTokenPriceEth",
  EQUITY_TOKEN_PRICE_EURO = "equityTokenPriceEuro",
  EQUITY_TOKEN_PRICE_EUR_TOKEN = "equityTokenPriceEuroToken",
  SHARE_PRICE = "sharePrice",
}

export enum ENumberOutputFormat {
  INTEGER = "integer",
  ONLY_NONZERO_DECIMALS = "onlyNonzeroDecimals", // see removeZeroDecimals unit test
  FULL = "full",
  ONLY_NONZERO_DECIMALS_ROUND_UP = "onlyNonzeroDecimalsRoundUp", // see removeZeroDecimals unit test
  FULL_ROUND_UP = "fullRoundUp",
}

export enum EAbbreviatedNumberOutputFormat {
  LONG = "long",
  SHORT = "short",
}

export type THumanReadableFormat = ENumberOutputFormat | EAbbreviatedNumberOutputFormat;

export enum ESpecialNumber {
  UNLIMITED = "unlimited",
}

export type TValueFormat = ECurrency | EPriceFormat | ENumberFormat | EquityToken;

export interface IToFixedPrecision {
  value: TBigNumberVariants;
  roundingMode?: ERoundingMode;
  inputFormat?: ENumberInputFormat;
  decimalPlaces: number | undefined;
  isPrice?: boolean;
  outputFormat?: THumanReadableFormat;
  decimals?: number;
}

export interface IFormatNumber {
  value: TBigNumberVariants;
  roundingMode?: ERoundingMode;
  inputFormat?: ENumberInputFormat;
  decimalPlaces?: number;
  isPrice?: boolean;
  outputFormat?: THumanReadableFormat;
  decimals?: number;
}

export interface IFormatShortNumber {
  value: TBigNumberVariants;
  roundingMode: ERoundingMode;
  inputFormat: ENumberInputFormat;
  decimalPlaces: number;
  outputFormat: THumanReadableFormat;
  decimals?: number;
}
