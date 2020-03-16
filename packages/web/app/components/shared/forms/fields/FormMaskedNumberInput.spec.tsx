import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import { expect } from "chai";
import { mount } from "enzyme";
import { Formik } from "formik";
import * as React from "react";

import { FormMaskedNumberInput } from "./FormMaskedNumberInput";

describe("FormMaskedNumberInput", () => {
  it("should show state value", () => {
    const testValue = "2568584.0987";
    const expectedValue = "2 568 584.09";

    const component = mount(
      <Formik initialValues={{ testField: testValue }} onSubmit={() => {}}>
        <FormMaskedNumberInput
          name="testField"
          storageFormat={ENumberInputFormat.FLOAT}
          outputFormat={ENumberOutputFormat.FULL}
          valueType={ECurrency.EUR}
          showUnits={true}
        />
      </Formik>,
    );

    expect(
      component
        .find("input")
        .first()
        .render()
        .val(),
    ).to.contain(expectedValue);
  });

  it("should format and show input value", () => {
    const initialValue = undefined;
    const inputValue = "1234";
    const expectedValue = "1 234";

    const component = mount(
      <Formik initialValues={{ testField: initialValue }} onSubmit={() => {}}>
        <FormMaskedNumberInput
          name="testField"
          storageFormat={ENumberInputFormat.FLOAT}
          outputFormat={ENumberOutputFormat.FULL}
          valueType={ECurrency.EUR}
          showUnits={true}
        />
      </Formik>,
    );

    expect(
      component
        .find("input")
        .first()
        .simulate("change", { target: { value: inputValue } })
        .simulate("blur", { target: { value: inputValue } }) //todo this doesn't work,
        .render()
        .val(),
    ).to.contain(expectedValue);
  });
});
