import { ECurrency } from "@neufund/shared";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { CurrencyIcon } from "./CurrencyIcon";

storiesOf("CurrencyIcon", module).add("all currencies", () => (
  <>
    {Object.values(ECurrency).map((currency, i) => (
      <span key={i} style={{ display: "inline-block", height: "2em", width: "3em" }}>
        <CurrencyIcon currency={currency} />
      </span>
    ))}
  </>
));
