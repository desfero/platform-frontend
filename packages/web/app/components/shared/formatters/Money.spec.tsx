import {
  EAbbreviatedNumberOutputFormat,
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
} from "@neufund/shared";
import { expect } from "chai";
import { shallow } from "enzyme";
import * as React from "react";

import { FormatShortNumber } from "./FormatShortNumber";
import { ECurrencySymbol, Money } from "./Money";

describe("Money", () => {
  it("should format money as ETH with full decimals according to `Neufund Language` style guide", () => {
    const component = shallow(
      <Money
        value={"1234567" + "0".repeat(16)}
        valueType={ECurrency.ETH}
        inputFormat={ENumberInputFormat.ULPS}
        outputFormat={ENumberOutputFormat.FULL}
      />,
    );

    expect(component.render().text()).to.be.eq("12 345.6700 ETH");
  });

  it("should format money as EUR with full decimals according to `Neufund Language` style guide", () => {
    const component = shallow(
      <Money
        value={"1234567" + "0".repeat(16)}
        valueType={ECurrency.EUR}
        inputFormat={ENumberInputFormat.ULPS}
        outputFormat={ENumberOutputFormat.FULL}
      />,
    );

    expect(component.render().text()).to.be.eq("12 345.67 EUR");
  });

  it("should round up when human readable format is set to FULL_ROUND_UP", () => {
    const component = shallow(
      <Money
        value={"2501234.1944"}
        valueType={ECurrency.EUR}
        inputFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.FULL_ROUND_UP}
      />,
    );

    expect(component.render().text()).to.be.eq("2 501 234.20 EUR");
  });

  it("should return money without decimal part when human readable format is set to INTEGER", () => {
    const component = shallow(
      <Money
        value={"2501234.1"}
        valueType={ECurrency.EUR}
        inputFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.INTEGER}
      />,
    );

    expect(component.render().text()).to.be.eq("2 501 234 EUR");
  });

  it("should return money without zero decimal part when human readable format is set to ONLY_NONZERO_DECIMALS", () => {
    const component1 = shallow(
      <Money
        value={"2501234.1944"}
        valueType={ECurrency.EUR}
        inputFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
      />,
    );
    const component2 = shallow(
      <Money
        value={"2501234.00000"}
        valueType={ECurrency.EUR}
        inputFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
      />,
    );

    expect(component1.render().text()).to.be.eq("2 501 234.19 EUR");
    expect(component2.render().text()).to.be.eq("2 501 234 EUR");
  });

  it("should return money without zero decimal part or rounded up when human readable format is set to ONLY_NONZERO_DECIMALS_ROUND_UP", () => {
    const component1 = shallow(
      <Money
        value={"2501234.1944"}
        valueType={ECurrency.EUR}
        inputFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
      />,
    );
    const component2 = shallow(
      <Money
        value={"2501234.00000"}
        valueType={ECurrency.EUR}
        inputFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
      />,
    );

    expect(component1.render().text()).to.be.eq("2 501 234.20 EUR");
    expect(component2.render().text()).to.be.eq("2 501 234 EUR");
  });

  it("should return money in abbreviated form", () => {
    const value1 = "2501234.1944";
    const value2 = "2501234.00000";

    const expectedProps = {
      value: "",
      inputFormat: ENumberInputFormat.FLOAT,
      roundingMode: ERoundingMode.HALF_UP,
      defaultValue: "-",
      decimalPlaces: 0,
      outputFormat: EAbbreviatedNumberOutputFormat.LONG,
      decimals: undefined,
    };

    const component1 = shallow(
      <Money
        value={value1}
        valueType={ECurrency.EUR}
        inputFormat={ENumberInputFormat.FLOAT}
        outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
      />,
    );
    const component2 = shallow(
      <Money
        value={value2}
        valueType={ECurrency.EUR}
        inputFormat={ENumberInputFormat.FLOAT}
        outputFormat={EAbbreviatedNumberOutputFormat.LONG}
      />,
    );
    expect(component1.find(FormatShortNumber).props()).to.deep.eq({
      ...expectedProps,
      value: value1,
      outputFormat: EAbbreviatedNumberOutputFormat.SHORT,
    });
    expect(component2.find(FormatShortNumber).props()).to.deep.eq({
      ...expectedProps,
      value: value2,
      outputFormat: EAbbreviatedNumberOutputFormat.LONG,
    });
  });

  it("should not add either token symbol or code  ", () => {
    const component = shallow(
      <Money
        value={"123456" + "0".repeat(16)}
        inputFormat={ENumberInputFormat.ULPS}
        valueType={ECurrency.EUR}
        outputFormat={ENumberOutputFormat.FULL}
        currencySymbol={ECurrencySymbol.NONE}
      />,
    );
    expect(component.render().text()).to.be.eq("1 234.56");
  });

  it("should output '-' when no value is provided", () => {
    const component = shallow(
      <Money
        inputFormat={ENumberInputFormat.ULPS}
        outputFormat={ENumberOutputFormat.FULL}
        valueType={ECurrency.EUR}
        value={undefined}
      />,
    );

    expect(component.text()).to.be.eq("-");
  });

  it("should output custom placeholder value when no value is provided", () => {
    const component = shallow(
      <Money
        inputFormat={ENumberInputFormat.ULPS}
        outputFormat={ENumberOutputFormat.FULL}
        valueType={ECurrency.EUR}
        value={undefined}
        defaultValue={"nothing here :))"}
      />,
    );

    expect(component.text()).to.be.eq("nothing here :))");
  });

  it("should format eur_token token", () => {
    const component = shallow(
      <Money
        value={"123456" + "0".repeat(16)}
        inputFormat={ENumberInputFormat.ULPS}
        outputFormat={ENumberOutputFormat.FULL}
        valueType={ECurrency.EUR_TOKEN}
      />,
    );

    expect(component.render().text()).to.be.eq("1 234.56 nEUR");
  });

  it("should have a span with a [data-test-id='units'] attribute ", () => {
    const component = shallow(
      <Money
        value={"123456" + "0".repeat(16)}
        inputFormat={ENumberInputFormat.ULPS}
        outputFormat={ENumberOutputFormat.FULL}
        valueType={ECurrency.EUR_TOKEN}
      />,
    );
    expect(component.find('[data-test-id="units"]').exists()).to.be.true;
  });
});
