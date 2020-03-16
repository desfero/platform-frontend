import {
  ECurrency,
  ENumberInputFormat,
  ERoundingMode,
  ETH_DECIMALS,
  formatMoney,
} from "@neufund/shared";

import { TBigNumberVariants } from "../../lib/web3/types";

const selectDecimalPlaces = (currency: ECurrency, isPrice?: boolean): number => {
  if (isPrice) {
    return 8;
  }

  switch (currency) {
    case ECurrency.ETH:
    case ECurrency.NEU:
      return 4;
    case ECurrency.EUR:
    case ECurrency.EUR_TOKEN:
      return 2;
  }
};

/*
 * @deprecated
 * */
function getFormatDecimals(format: ENumberInputFormat): number {
  switch (format) {
    case ENumberInputFormat.ULPS:
      return ETH_DECIMALS;
    case ENumberInputFormat.FLOAT:
      return 0;
    default:
      throw new Error("Unsupported money format");
  }
}
/*
 * @deprecated
 * Use app/components/shared/formatters/Money or app/components/shared/formatters/FormatNumber
 * */
export function getFormattedMoney(
  value: TBigNumberVariants,
  currency: ECurrency,
  format: ENumberInputFormat,
  isPrice?: boolean,
  roundingMode?: ERoundingMode,
): string {
  return formatMoney(
    value,
    getFormatDecimals(format),
    selectDecimalPlaces(currency, isPrice),
    roundingMode,
  );
}

export { selectDecimalPlaces };
