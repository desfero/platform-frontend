import { ECurrency, ENumberInputFormat, ERoundingMode, toFixedPrecision } from "@neufund/shared";

import { selectDecimalPlaces } from "../../../../components/shared/Money.unsafe";

export const toFormValue = (amountUlps: string, decimals?: number) =>
  toFixedPrecision({
    value: amountUlps,
    decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
    inputFormat: ENumberInputFormat.ULPS,
    roundingMode: ERoundingMode.DOWN,
    decimals,
  });

export const toFixedPrecisionGasCostEth = (value: string) =>
  toFixedPrecision({
    value,
    inputFormat: ENumberInputFormat.ULPS,
    decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
    roundingMode: ERoundingMode.HALF_UP,
  });

export const toFixedPrecisionGasCostEur = (value: string) =>
  toFixedPrecision({
    value,
    inputFormat: ENumberInputFormat.ULPS,
    decimalPlaces: selectDecimalPlaces(ECurrency.EUR),
    roundingMode: ERoundingMode.HALF_UP,
  });

export const toFixedPrecisionAmountEth = (value: string) =>
  toFixedPrecision({
    value,
    inputFormat: ENumberInputFormat.ULPS,
    decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
    roundingMode: ERoundingMode.DOWN,
  });

export const toFixedPrecisionAmountEur = (value: string) =>
  toFixedPrecision({
    value,
    inputFormat: ENumberInputFormat.ULPS,
    decimalPlaces: selectDecimalPlaces(ECurrency.EUR),
    roundingMode: ERoundingMode.DOWN,
  });
