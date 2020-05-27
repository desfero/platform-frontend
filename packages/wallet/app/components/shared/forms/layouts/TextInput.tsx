import * as React from "react";
import {
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TextInput as NativeTextInput,
  TextInputFocusEventData,
} from "react-native";

import { st } from "components/utils";

import {
  baseGray,
  baseRed,
  baseWhite,
  blueyGray,
  grayLighter4,
  silverLighter1,
  yellowDarker1,
} from "styles/colors";
import { roundness } from "styles/common";
import { typographyStyles } from "styles/typography";

type TNativeTextInputProps = Omit<React.ComponentProps<typeof NativeTextInput>, "editable">;
type TExternalProps = { disabled?: boolean; invalid?: boolean } & TNativeTextInputProps;

/**
 * A text input component that aligns with our design system
 */
const TextInput = React.forwardRef<NativeTextInput, TExternalProps>(
  ({ style, onFocus, onBlur, disabled, invalid, ...props }, ref) => {
    const [hasFocus, setHasFocus] = React.useState(false);

    const handleFocus = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setHasFocus(true);

      onFocus?.(event);
    };

    const handleBlur = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setHasFocus(false);

      onBlur?.(event);
    };

    return (
      <NativeTextInput
        ref={ref}
        editable={!disabled}
        placeholderTextColor={blueyGray}
        selectionColor={yellowDarker1}
        style={st(
          styles.input,
          [hasFocus, styles.inputFocused],
          [disabled, styles.inputDisabled],
          [invalid, styles.inputInvalid],
          style,
        )}
        onBlur={handleBlur}
        onFocus={handleFocus}
        {...props}
      />
    );
  },
);

const styles = StyleSheet.create({
  input: {
    ...typographyStyles.body,
    // there is a bug in RN where `lineHeight` to not enforce height changes
    lineHeight: undefined,
    textAlignVertical: "top",
    backgroundColor: baseWhite,
    borderColor: grayLighter4,
    borderRadius: roundness,
    borderStyle: "solid",
    borderWidth: 1,
    color: baseGray,
    ...Platform.select({
      default: {
        paddingTop: 13,
        paddingBottom: 14,
      },
      // android adds additional line-height so padding needs to be calculated separately
      android: {
        paddingTop: 13,
        paddingBottom: 5,
      },
    }),
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: baseGray,
  },
  inputDisabled: {
    backgroundColor: silverLighter1,
    color: blueyGray,
  },
  inputInvalid: {
    borderColor: baseRed,
  },
});

export { TextInput };
