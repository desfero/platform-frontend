import {Eur} from '@neufund/design-system';
import {
  ECurrency,
  ENumberInputFormat,
  ERoundingMode,
  multiplyBigNumbers,
} from "@neufund/shared";
import * as React from "react";

import { getFormattedMoney } from "../../../shared/Money.unsafe";

const CalculatedFee: React.FunctionComponent<{ amount: string; bankFee: string }> = ({
  amount,
  bankFee,
}) => {
  const providedAmount =
    !isNaN(Number(amount)) && Number(amount) > 0
      ? getFormattedMoney(
          amount,
          ECurrency.EUR,
          ENumberInputFormat.FLOAT,
          false,
          ERoundingMode.HALF_UP,
        )
      : "0";
  const calculatedFee = multiplyBigNumbers([providedAmount, bankFee]);

  return (
    <Eur
      data-test-id="bank-transfer.redeem.init.fee"
      value={calculatedFee}
    />
  );
};

export { CalculatedFee };
