import * as React from "react";
import { StyleSheet } from "react-native";

import { TComponentRefType } from "../../../../utils/types";
import { TextInput } from "./TextInput";

type TNativeTextInputProps = React.ComponentProps<typeof TextInput>;
type TExternalProps = Omit<TNativeTextInputProps, "multiline" | "numberOfLines">;

type TRef = TComponentRefType<typeof TextInput>;
/**
 * A text area component that aligns with our design system
 * @note It's wrapper around TextInput to provide consistent look for multiline text inputs
 */
const TextAreaInput = React.forwardRef<TRef, TExternalProps>(({ style, ...props }, ref) => (
  <TextInput style={[styles.textAreaInput, style]} multiline={true} ref={ref} {...props} />
));

const styles = StyleSheet.create({
  textAreaInput: {
    lineHeight: 24,
    minHeight: 120,
  },
});

export { TextAreaInput };
