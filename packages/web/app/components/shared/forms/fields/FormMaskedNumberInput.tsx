import { ENumberInputFormat, ENumberOutputFormat, TValueFormat, XOR } from "@neufund/shared";
import { Field, FieldProps } from "formik";
import * as React from "react";

import { MaskedNumberInputLayout } from "../layouts/MaskedNumberInputLayout";
import { useFieldMeta } from "./utils";

interface ICommonProps {
  ignoreTouched?: boolean;
}

type TLayoutProps = Omit<
  React.ComponentProps<typeof MaskedNumberInputLayout>,
  "onChangeFn" | "value" | "invalid"
>;

interface IFormMaskedNumberProps {
  storageFormat: ENumberInputFormat;
  outputFormat: ENumberOutputFormat;
}

interface IFormMaskedNumberMoneyProps {
  storageFormat: ENumberInputFormat;
  outputFormat: ENumberOutputFormat;
  valueType: TValueFormat;
  showUnits: boolean;
}

type TExternalProps = XOR<IFormMaskedNumberProps, IFormMaskedNumberMoneyProps>;

const FormMaskedNumberInput: React.FunctionComponent<ICommonProps &
  TExternalProps &
  TLayoutProps> = ({ name, ignoreTouched, ...layoutProps }) => {
  const { invalid, changeValue } = useFieldMeta(name, { ignoreTouched: !!ignoreTouched });

  return (
    <Field name={name}>
      {({ field }: FieldProps) => (
        <MaskedNumberInputLayout
          name={name}
          value={field.value}
          onChangeFn={changeValue}
          invalid={invalid}
          {...layoutProps}
        />
      )}
    </Field>
  );
};

export { FormMaskedNumberInput };
