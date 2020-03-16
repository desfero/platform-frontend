import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { MaskedNumberInputLayout } from "./MaskedNumberInputLayout";

const defaultProps = {
  outputFormat: ENumberOutputFormat.FULL,
  name: "ethInput",
  value: "1234567" + "0".repeat(16),
  onChangeFn: action("setValue"),
  placeholder: "money input placeholder",
  "data-test-id": "dataTestID",
  setError: action("error"),
  invalid: false,
};

storiesOf("MaskedNumberInput", module)
  .add("shows Eth (4 decimal places)", () => (
    <MaskedNumberInputLayout
      {...defaultProps}
      valueType={ECurrency.ETH}
      storageFormat={ENumberInputFormat.ULPS}
    />
  ))
  .add("shows EuroToken (2 decimal places)", () => (
    <MaskedNumberInputLayout
      {...defaultProps}
      valueType={ECurrency.EUR_TOKEN}
      storageFormat={ENumberInputFormat.ULPS}
    />
  ))
  .add("shows EuroToken (2 decimal places) with units", () => (
    <MaskedNumberInputLayout
      {...defaultProps}
      valueType={ECurrency.EUR_TOKEN}
      storageFormat={ENumberInputFormat.ULPS}
      showUnits={true}
    />
  ));
