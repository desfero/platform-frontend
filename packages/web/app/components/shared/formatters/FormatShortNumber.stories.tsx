import { EAbbreviatedNumberOutputFormat, ENumberInputFormat } from "@neufund/shared";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { FormatShortNumber, FormatShortNumberRange } from "./FormatShortNumber";

storiesOf("FormatShortNumber", module)
  .add("one million", () => (
    <FormatShortNumber
      value={"1000000"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
    />
  ))
  .add("one million short", () => (
    <FormatShortNumber
      value={"1000000"}
      outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
      inputFormat={ENumberInputFormat.FLOAT}
    />
  ))
  .add("2 millions", () => (
    <FormatShortNumber
      value={"2000000"}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
      inputFormat={ENumberInputFormat.FLOAT}
    />
  ))
  .add("2 millions short", () => (
    <FormatShortNumber
      value={"2000000"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
    />
  ))
  .add("5.5 millions", () => (
    <FormatShortNumber
      value={"5500000"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
    />
  ))
  .add("5.5 millions short", () => (
    <FormatShortNumber
      value={"5500000"}
      outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
      inputFormat={ENumberInputFormat.FLOAT}
    />
  ))
  .add("25 millions", () => (
    <FormatShortNumber
      value={"25000000"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
    />
  ))
  .add("one thousand", () => (
    <FormatShortNumber
      value={"1000"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
    />
  ))
  .add("one thousand short", () => (
    <FormatShortNumber
      value={"1000"}
      outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
      inputFormat={ENumberInputFormat.FLOAT}
    />
  ))
  .add("2 thousands", () => (
    <FormatShortNumber
      value={"2000"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
    />
  ))
  .add("9.9 thousands", () => (
    <FormatShortNumber
      value={"9900"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
    />
  ))
  .add("125 thousands", () => (
    <FormatShortNumber
      value={"125000"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
    />
  ))
  .add("125 thousands short", () => (
    <FormatShortNumber
      value={"125000"}
      outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
      inputFormat={ENumberInputFormat.FLOAT}
    />
  ))
  .add("1", () => (
    <FormatShortNumber
      value={"1"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
    />
  ))
  .add("999", () => (
    <FormatShortNumber
      value={"999"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
    />
  ))
  .add("1.5 - 10 millions", () => (
    <FormatShortNumberRange
      valueFrom={"1500000"}
      valueUpto={"10000000"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
    />
  ))
  .add("1.5 - 10 millions short", () => (
    <FormatShortNumberRange
      valueFrom={"1500000"}
      valueUpto={"10000000"}
      outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
      inputFormat={ENumberInputFormat.FLOAT}
    />
  ))
  .add("120 - 1000 thousands", () => (
    <FormatShortNumberRange
      valueFrom={"120000"}
      valueUpto={"1000000"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
    />
  ))
  .add("120 - 1000 thousands short", () => (
    <FormatShortNumberRange
      valueFrom={"120000"}
      valueUpto={"1000000"}
      outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
      inputFormat={ENumberInputFormat.FLOAT}
    />
  ))
  .add("500 - 20000", () => (
    <FormatShortNumberRange
      valueFrom={"500"}
      valueUpto={"20000"}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={EAbbreviatedNumberOutputFormat.LONG}
    />
  ))
  .add("500 - 20000 short", () => (
    <FormatShortNumberRange
      valueFrom={"500"}
      valueUpto={"20000"}
      outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
      inputFormat={ENumberInputFormat.FLOAT}
    />
  ));
