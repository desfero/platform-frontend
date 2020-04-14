import { assertNever } from "@neufund/shared";
import React from "react";
import { StyleSheet, TouchableHighlight } from "react-native";

import {
  baseGray,
  baseWhite,
  baseYellow,
  blueyGrey,
  grayLighter2,
  grayLighter4,
  silverLighter1,
  silverLighter2,
  yellowDarker1,
} from "../../../styles/colors";
import { LoadingIndicator } from "../LoadingIndicator";
import { Touchable } from "../Touchable";
import { BodyBoldText } from "../typography/BodyText";

enum EButtonLayout {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  TEXT = "text",
  TEXT_DARK = "text_dark",
}

type TTouchableProps = React.ComponentProps<typeof Touchable>;

type TExternalProps = { layout: EButtonLayout; loading?: boolean } & Omit<
  TTouchableProps,
  "activeColor"
>;

const getButtonStyle = (layout: EButtonLayout) => {
  switch (layout) {
    case EButtonLayout.PRIMARY:
      return { button: styles.buttonPrimary };
    case EButtonLayout.SECONDARY:
      return { button: styles.buttonSecondary };
    case EButtonLayout.TEXT:
      return { button: styles.buttonText, buttonDisabled: styles.buttonTextDisabled };
    case EButtonLayout.TEXT_DARK:
      return {
        button: styles.buttonText,
        buttonDisabled: styles.buttonTextDisabled,
        label: styles.buttonTextDarkLabel,
        labelDisabled: styles.buttonTextDarkDisabledLabel,
      };
    default:
      assertNever(layout);
  }
};

/**
 * A button that aligns with our design system.
 */
const Button = React.forwardRef<TouchableHighlight, TExternalProps>(
  ({ layout, children, style, loading, disabled, ...props }, ref) => {
    const buttonStyle = getButtonStyle(layout);

    const isDisabled = disabled || loading;

    return (
      <Touchable
        ref={ref}
        style={[
          styles.buttonCommon,
          buttonStyle.button,
          isDisabled && [styles.buttonCommonDisabled, buttonStyle.buttonDisabled],
          style,
        ]}
        activeColor={yellowDarker1}
        accessibilityRole="button"
        accessibilityComponentType="button"
        accessibilityTraits={isDisabled ? ["button", "disabled"] : "button"}
        accessibilityStates={isDisabled ? ["disabled"] : []}
        disabled={isDisabled}
        {...props}
      >
        <BodyBoldText
          style={[
            styles.buttonCommonLabel,
            buttonStyle.label,
            isDisabled && [styles.buttonCommonDisabledLabel, buttonStyle.labelDisabled],
          ]}
        >
          {loading ? (
            <>
              {/* We need empty spaces to force the same button size */}
              &nbsp;
              <LoadingIndicator />
              &nbsp;
            </>
          ) : (
            children
          )}
        </BodyBoldText>
      </Touchable>
    );
  },
);

const styles = StyleSheet.create({
  // Common button styles
  buttonCommon: {
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "solid",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  buttonCommonLabel: {
    color: baseGray,
  },
  buttonCommonDisabled: {
    borderColor: silverLighter1,
    backgroundColor: silverLighter1,
  },
  buttonCommonDisabledLabel: {
    color: blueyGrey,
  },

  // Primary button
  buttonPrimary: {
    borderColor: baseYellow,
    backgroundColor: baseYellow,
  },

  // Secondary button
  buttonSecondary: {
    borderColor: grayLighter4,
    backgroundColor: baseWhite,
  },

  // Text button
  buttonText: {
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  buttonTextDisabled: {
    borderColor: "transparent",
    backgroundColor: "transparent",
  },

  // Text dark button
  buttonTextDarkLabel: {
    color: silverLighter2,
  },
  buttonTextDarkDisabledLabel: {
    color: grayLighter2,
  },
});

export { Button, EButtonLayout };
