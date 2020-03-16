import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import { expect } from "chai";
import { shallow } from "enzyme";
import * as React from "react";

import { MoneyWithLessThan } from "./MoneyWithLessThan";

describe("MoneyWithLessThan", () => {
  it("should format money as ETH with full decimals according to `Neufund Language` style guide", () => {
    const component = shallow(
      <MoneyWithLessThan
        value={"1234567" + "0".repeat(16)}
        valueType={ECurrency.ETH}
        inputFormat={ENumberInputFormat.ULPS}
        outputFormat={ENumberOutputFormat.FULL}
      />,
    );

    expect(component.render().text()).to.be.eq("12 345.6700 ETH");
  });
  it("should format money as ETH with 0 if value it Zero", () => {
    const component = shallow(
      <MoneyWithLessThan
        value="0"
        valueType={ECurrency.ETH}
        inputFormat={ENumberInputFormat.ULPS}
        outputFormat={ENumberOutputFormat.FULL}
      />,
    );

    expect(component.render().text()).to.be.eq("0.0000 ETH");
  });

  it("should format money as ETH with < 0.001 if value if the value is too small to show", () => {
    const component = shallow(
      <MoneyWithLessThan
        value={"111"}
        valueType={ECurrency.ETH}
        inputFormat={ENumberInputFormat.ULPS}
        outputFormat={ENumberOutputFormat.FULL}
      />,
    );

    expect(component.render().text()).to.be.eq("< 0.0001 ETH");
  });
});
