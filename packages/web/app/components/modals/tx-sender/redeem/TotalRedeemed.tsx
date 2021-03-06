import { multiplyBigNumbers, Q18, subtractBigNumbers } from "@neufund/shared-utils";
import * as React from "react";

import { Money } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  isEmptyValue,
  isValidNumber,
} from "../../../shared/formatters/utils";

const TotalRedeemed: React.FunctionComponent<{ amount: string; bankFee: string }> = ({
  amount,
  bankFee,
}) => {
  const providedAmount = isValidNumber(amount) || (isEmptyValue(amount) && 0) ? amount : "0";
  const calculatedFee = multiplyBigNumbers([providedAmount, bankFee]);
  const totalRedeemed = subtractBigNumbers([Q18.mul(providedAmount), calculatedFee]);

  return (
    <Money
      value={totalRedeemed}
      inputFormat={ENumberInputFormat.ULPS}
      valueType={ECurrency.EUR}
      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
    />
  );
};

export { TotalRedeemed };
