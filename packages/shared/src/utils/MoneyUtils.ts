import BigNumber from "bignumber.js";

import { ERoundingMode } from "./formatters";
import { TBigNumberVariants } from "./types";
/*
 * @deprecated
 * use "/app/components/shared/formatters/utils.ts"
 * */
export function formatToFixed(
  moneyInPrimaryBase: BigNumber,
  decimalPlaces: number,
  roundingMode?: ERoundingMode,
): string {
  switch (roundingMode) {
    case ERoundingMode.DOWN:
      return moneyInPrimaryBase.toFixed(decimalPlaces, BigNumber.ROUND_DOWN);
    case ERoundingMode.HALF_DOWN:
      return moneyInPrimaryBase.toFixed(decimalPlaces, BigNumber.ROUND_HALF_DOWN);
    case ERoundingMode.HALF_UP:
      return moneyInPrimaryBase.toFixed(decimalPlaces, BigNumber.ROUND_HALF_UP);
    case ERoundingMode.UP:
    default:
      return moneyInPrimaryBase.toFixed(decimalPlaces, BigNumber.ROUND_UP);
  }
}

/**
 * Formats number to desired decimals and precision.
 * IMPORTANT: Use only for display in UI, not for token calculations in business logic!
 * @deprecated
 * use "/app/components/shared/formatters/Money.tsx" and utils
 */
export function formatMoney(
  value: TBigNumberVariants,
  currencyDecimals: number,
  decimalPlaces?: number,
  roundingMode?: ERoundingMode,
): string {
  //convert value to string to avoid 'more than 15 chars' error
  const money = value instanceof BigNumber ? value : new BigNumber(value.toString());
  const moneyInPrimaryBase = money.div(new BigNumber("10").pow(currencyDecimals));
  return decimalPlaces !== undefined
    ? formatToFixed(moneyInPrimaryBase, decimalPlaces, roundingMode)
    : moneyInPrimaryBase.toString();
}
