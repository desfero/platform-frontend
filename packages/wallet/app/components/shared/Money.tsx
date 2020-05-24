import { EquityToken, ECurrency } from "@neufund/shared-utils";
import * as React from "react";

type TExternalProps = {
  value: string;
  currency: EquityToken | ECurrency;
  decimalPlaces: number;
};

// TODO: Used to keep money related logic easy to change. Replace with proper formatting when ready
const Money: React.FunctionComponent<TExternalProps> = ({ value, currency }) => (
  <>
    {value} {currency}
  </>
);

export { Money };
