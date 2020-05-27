import { assertNever } from "@neufund/shared-utils";
import { Ref } from "react";
import * as React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { TComponentRefType } from "../../../../utils/types";
import { HelperText } from "../../typography/HelperText";
import { ErrorMessage } from "./ErrorMessage";
import { Label } from "./Label";
import { TextAreaInput } from "./TextAreaInput";
import { TextInput } from "./TextInput";
import { Switcher } from "./switcher/Switcher";

enum EFieldType {
  INPUT = "input",
  TEXT_AREA = "text-area",
  SWITCHER = "switcher",
}

type TInputProps =
  | ({ type: EFieldType.INPUT } & React.ComponentPropsWithRef<typeof TextInput>)
  | ({ type: EFieldType.TEXT_AREA } & React.ComponentPropsWithRef<typeof TextAreaInput>)
  | ({ type: EFieldType.SWITCHER } & React.ComponentPropsWithRef<typeof Switcher>);

type TExternalProps = {
  label?: string;
  style?: StyleProp<ViewStyle>;
  helperText?: string;
  errorMessage?: string;
  inputRef?: Ref<TComponentRefType<typeof TextInput>> | Ref<TComponentRefType<typeof Switcher>>;
} & TInputProps;

const getInput = (props: TInputProps) => {
  switch (props.type) {
    case EFieldType.INPUT:
      return <TextInput {...props} />;
    case EFieldType.TEXT_AREA:
      return <TextAreaInput {...props} />;
    case EFieldType.SWITCHER:
      return <Switcher {...props} />;
    default:
      assertNever(props, "Invalid input type");
  }
};

/**
 * A wrapper around label, input/select, help text and error message to just provide single top level api to be used in components
 */
const FieldLayout: React.FunctionComponent<TExternalProps> = ({
  style,
  label,
  errorMessage,
  helperText,
  inputRef,
  ...inputProps
}) => {
  const invalid = !!errorMessage;

  return (
    <View style={[styles.field, style]}>
      {label && <Label>{label}</Label>}
      {getInput({ invalid, ref: inputRef, ...inputProps })}
      {errorMessage && <ErrorMessage style={styles.helperText}>{errorMessage}</ErrorMessage>}
      {helperText && !errorMessage && (
        <HelperText style={styles.helperText}>{helperText}</HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    marginBottom: 10,
  },
  helperText: {
    marginTop: 4,
  },
});

export { FieldLayout, EFieldType };
