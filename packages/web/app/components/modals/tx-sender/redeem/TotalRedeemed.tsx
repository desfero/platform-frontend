import {Eur} from '@neufund/design-system';
import {
  ENumberOutputFormat,
  isEmptyValue,
  isValidNumber,
  multiplyBigNumbers,
  Q18,
  subtractBigNumbers,
} from "@neufund/shared";
import * as React from "react";


const TotalRedeemed: React.FunctionComponent<{ amount: string; bankFee: string }> = ({
  amount,
  bankFee,
}) => {
  const providedAmount = isValidNumber(amount) || (isEmptyValue(amount) && 0) ? amount : "0";
  const calculatedFee = multiplyBigNumbers([providedAmount, bankFee]);
  const totalRedeemed = subtractBigNumbers([Q18.mul(providedAmount), calculatedFee]);

  return (
    <Eur
      value={totalRedeemed}
      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
    />
  );
};

export { TotalRedeemed };
