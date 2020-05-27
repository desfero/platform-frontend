import { assertNever } from "@neufund/shared-utils";
import { useField } from "formik";
import React, { Ref } from "react";
import { StyleProp, ViewStyle } from "react-native";

import { EFieldType, FieldLayout } from "components/shared/forms/layouts/FieldLayout";
import { TextAreaInput } from "components/shared/forms/layouts/TextAreaInput";
import { TextInput } from "components/shared/forms/layouts/TextInput";
import { Switcher } from "components/shared/forms/layouts/switcher/Switcher";

import { TComponentRefType } from "utils/types";

type TCustomInputProps =
  | ({ type: EFieldType.INPUT } & Pick<React.ComponentProps<typeof TextInput>, "placeholder">)
  | ({ type: EFieldType.TEXT_AREA } & Pick<
      React.ComponentProps<typeof TextAreaInput>,
      "placeholder"
    >)
  | ({ type: EFieldType.SWITCHER } & Pick<React.ComponentProps<typeof Switcher>, "items">);

type TExternalProps = {
  name: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
  helperText?: string;
  inputRef?: Ref<TComponentRefType<typeof TextInput>> | Ref<TComponentRefType<typeof Switcher>>;
} & TCustomInputProps;

/**
 * A formik wrapper around `FieldLayout` component
 */
const Field: React.FunctionComponent<TExternalProps> = props => {
  const [field, meta] = useField(props);

  switch (props.type) {
    case EFieldType.INPUT:
    case EFieldType.TEXT_AREA:
      return (
        <FieldLayout
          onChangeText={field.onChange(props.name)}
          onBlur={field.onBlur(props.name)}
          value={field.value}
          errorMessage={(meta.touched && meta.error) || undefined}
          {...props}
        />
      );

    case EFieldType.SWITCHER:
      return (
        <FieldLayout
          onChangeItem={field.onChange(props.name)}
          selectedItemId={field.value}
          errorMessage={(meta.touched && meta.error) || undefined}
          {...props}
        />
      );

    default:
      assertNever(props);
  }
};

export { Field };
