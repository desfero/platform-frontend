import { EAbbreviatedNumberOutputFormat, ENumberInputFormat } from "@neufund/shared";
import { expect } from "chai";
import { mount } from "enzyme";
import * as React from "react";

import { wrapWithIntl } from "../../../../test/integrationTestUtils.unsafe";
import { FormatShortNumber } from "./FormatShortNumber";

describe("FormatShortNumber component LONG", () => {
  it("should render number in LONG abbreviated form", () => {
    const component = mount(
      wrapWithIntl(
        <FormatShortNumber
          value={"123"}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={EAbbreviatedNumberOutputFormat.LONG}
        />,
      ),
    );
    expect(component.render().text()).to.be.eq("123");
  });
  it("should render number in LONG abbreviated form, rounded half up", () => {
    const component = mount(
      wrapWithIntl(
        <FormatShortNumber
          value={"123.136"}
          decimalPlaces={2}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={EAbbreviatedNumberOutputFormat.LONG}
        />,
      ),
    );
    expect(component.render().text()).to.be.eq("123.14");
  });
  it("should render number in LONG abbreviated form, rounded half up", () => {
    const component = mount(
      wrapWithIntl(
        <FormatShortNumber
          value={"123.18"}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={EAbbreviatedNumberOutputFormat.LONG}
        />,
      ),
    );
    expect(component.render().text()).to.be.eq("123.18");
  });
  it("should render number in LONG abbreviated form - thousands", () => {
    const component = mount(
      wrapWithIntl(
        <FormatShortNumber
          value={"12345"}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={EAbbreviatedNumberOutputFormat.LONG}
        />,
      ),
    );
    expect(component.render().text()).to.be.eq("12.3 thousand");
  });
  it("should render number in LONG abbreviated form - thousands, rounded half up", () => {
    const component = mount(
      wrapWithIntl(
        <FormatShortNumber
          value={"12354"}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={EAbbreviatedNumberOutputFormat.LONG}
        />,
      ),
    );
    expect(component.render().text()).to.be.eq("12.4 thousand");
  });
  it("should render number in LONG abbreviated form - millions", () => {
    const component = mount(
      wrapWithIntl(
        <FormatShortNumber
          value={"12345678"}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={EAbbreviatedNumberOutputFormat.LONG}
        />,
      ),
    );
    expect(component.render().text()).to.be.eq("12.3 million");
  });
});

describe("FormatShortNumber component SHORT", () => {
  it("should render number in SHORT abbreviated form", () => {
    const component = mount(
      wrapWithIntl(
        <FormatShortNumber
          value={"123"}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
        />,
      ),
    );
    expect(component.render().text()).to.be.eq("123");
  });
  it("should render number in SHORT abbreviated form - thousands", () => {
    const component = mount(
      wrapWithIntl(
        <FormatShortNumber
          value={"12345"}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
        />,
      ),
    );
    expect(component.render().text()).to.be.eq("12.3k");
  });
  it("should render number in SHORT abbreviated form - thousands, rounded half up", () => {
    const component = mount(
      wrapWithIntl(
        <FormatShortNumber
          value={"12354"}
          decimalPlaces={2}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
        />,
      ),
    );
    expect(component.render().text()).to.be.eq("12.4k");
  });
  it("should render number in SHORT abbreviated form - millions", () => {
    const component = mount(
      wrapWithIntl(
        <FormatShortNumber
          value={"12345678"}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
        />,
      ),
    );
    expect(component.render().text()).to.be.eq("12.3M");
  });
});
