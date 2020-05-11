import { action } from "@storybook/addon-actions";
import * as React from "react";
import { storiesOf } from "@storybook/react-native";

import { EFieldType, FieldLayout } from "./FieldLayout";
import { switcherItemsWithTitleAndSubTitle } from "./switcher/Switcher.stories";

storiesOf("Molecules|FieldLayout", module)
  .add("input", () => (
    <FieldLayout
      label="User name"
      type={EFieldType.INPUT}
      placeholder="Lorem ipsum..."
      helperText="It's an important information for us to provide the best user experience"
    />
  ))
  .add("input without label", () => (
    <FieldLayout
      type={EFieldType.INPUT}
      placeholder="Lorem ipsum..."
      helperText="It's an important information for us to provide the best user experience"
    />
  ))
  .add("invalid input", () => (
    <FieldLayout
      label="User name"
      type={EFieldType.INPUT}
      value="desfero"
      helperText="It's an important information for us to provide the best user experience"
      errorMessage="User name already in use"
    />
  ))
  .add("disabled input", () => (
    <FieldLayout label="User name" type={EFieldType.INPUT} disabled={true} value="desfero" />
  ))
  .add("textarea", () => (
    <FieldLayout
      label="User name"
      type={EFieldType.TEXT_AREA}
      placeholder="Lorem ipsum..."
      helperText="It's an important information for us to provide the best user experience"
    />
  ))
  .add("switcher", () => (
    <FieldLayout
      label="User name"
      type={EFieldType.SWITCHER}
      selectedItemId="0xBA9807E260E1E162F46a5ACd228153EdFE2604eC"
      items={switcherItemsWithTitleAndSubTitle}
      helperText="It's an important information for us to provide the best user experience"
      onChangeItem={action("onChangeItem")}
    />
  ))
  .add("switcher without label and helper text", () => (
    <FieldLayout
      type={EFieldType.SWITCHER}
      selectedItemId="0xBA9807E260E1E162F46a5ACd228153EdFE2604eC"
      items={switcherItemsWithTitleAndSubTitle}
      onChangeItem={action("onChangeItem")}
    />
  ))
  .add("switcher disabled", () => (
    <FieldLayout
      disabled={true}
      type={EFieldType.SWITCHER}
      selectedItemId="0xBA9807E260E1E162F46a5ACd228153EdFE2604eC"
      items={switcherItemsWithTitleAndSubTitle}
      onChangeItem={action("onChangeItem")}
    />
  ))
  .add("switcher inavlid", () => (
    <FieldLayout
      invalid={true}
      type={EFieldType.SWITCHER}
      selectedItemId="0xBA9807E260E1E162F46a5ACd228153EdFE2604eC"
      items={switcherItemsWithTitleAndSubTitle}
      onChangeItem={action("onChangeItem")}
    />
  ));
