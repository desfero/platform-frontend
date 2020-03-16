import {
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  selectDecimalPlaces,
  selectUnits,
  toFixedPrecision,
} from "@neufund/shared";
import BigNumber from "bignumber.js";
import * as cn from "classnames";
import * as React from "react";

import { CommonHtmlProps } from "../../../types";
import { IMoneyCommonProps, Money } from "./Money";

import * as styles from "./Money.module.scss";

export const MoneyWithLessThan: React.FunctionComponent<{
  value: string;
} & IMoneyCommonProps &
  CommonHtmlProps> = ({ value, valueType, ...props }) => {
  const fixedZeroPricision = toFixedPrecision({
    value: "0.000",
    inputFormat: ENumberInputFormat.ULPS,
    decimalPlaces: selectDecimalPlaces(valueType),
    roundingMode: ERoundingMode.HALF_UP,
  });
  //TODO: Refactor Money + Formatters to reuse the components
  return fixedZeroPricision ===
    toFixedPrecision({
      value,
      inputFormat: ENumberInputFormat.ULPS,
      decimalPlaces: selectDecimalPlaces(valueType),
      roundingMode: ERoundingMode.HALF_UP,
    }) && !new BigNumber(value).isZero() ? (
    <span className={cn(styles.money, props.className, props.theme)}>
      &#60; {new BigNumber("10").toPower(-selectDecimalPlaces(valueType)).toString()}
      <span className={cn(styles.currency)} data-test-id="units">
        {" "}
        {selectUnits(valueType)}
      </span>
    </span>
  ) : (
    <Money
      value={value}
      valueType={valueType}
      inputFormat={ENumberInputFormat.ULPS}
      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
      {...props}
    />
  );
};
