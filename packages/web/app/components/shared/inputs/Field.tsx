import { getSchemaField, getValidationSchema, isRequired } from "@neufund/shared";
import { Field, FieldProps, FormikConsumer, getIn } from "formik";
import * as React from "react";

import { TDataTestId } from "../../../types";
import { applyCharactersLimit, isNonValid } from "../forms/fields/utils.unsafe";
import { InputBase } from "./InputBase";
import { InputDescription } from "./InputDescription";
import { InputError } from "./InputError";
import { LabelBase } from "./LabelBase";
import { TextInput } from "./TextInput";

const transform = (value: string) => (value !== undefined ? value : "");

const transformBack = (value: number | string, charactersLimit?: number) => {
  if (typeof value === "number") {
    return value;
  } else if (typeof value === "string") {
    return value.trim().length > 0 ? applyCharactersLimit(value, charactersLimit) : undefined;
  } else {
    return undefined;
  }
};

type TFieldProps = {
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  placeholder?: string;
  ignoreTouched?: boolean;
};

export const FieldLayout: React.FunctionComponent<TFieldProps &
  TDataTestId &
  React.ComponentProps<typeof InputBase>> = ({
  "data-test-id": dataTestId,
  name,
  label,
  description,
  disabled,
  placeholder,
  type,
  maxLength,
  ignoreTouched,
  autoFocus,
  ...props
}) => (
  <FormikConsumer>
    {({ touched, errors, setFieldTouched, setFieldValue, submitCount, validationSchema }) => {
      const invalid = isNonValid(touched, errors, name, submitCount, ignoreTouched);
      const schema = getValidationSchema(validationSchema);
      const fieldSchema = getSchemaField(name, schema);
      const error = getIn(errors, name);

      return (
        <div data-test-id={dataTestId}>
          {label && (
            <LabelBase htmlFor={name} isOptional={!isRequired(fieldSchema)}>
              {label}
            </LabelBase>
          )}
          <Field
            name={name}
            render={({ field }: FieldProps) => {
              const value = transform(field.value);
              return (
                <TextInput
                  value={value}
                  id={field.name}
                  aria-describedby={description ? `${name}-description` : undefined}
                  aria-invalid={invalid}
                  autoFocus={autoFocus}
                  disabled={disabled}
                  placeholder={placeholder}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldTouched(name);
                    setFieldValue(
                      name,
                      transformBack(
                        type === "number" && e.target.value !== ""
                          ? e.target.valueAsNumber
                          : e.target.value,
                        maxLength,
                      ),
                    );
                  }}
                  {...props}
                />
              );
            }}
          />
          {invalid && error && <InputError name={name}>{error}</InputError>}
          {description && <InputDescription name={name}>{description}</InputDescription>}
        </div>
      );
    }}
  </FormikConsumer>
);
