import { assertNever } from "@neufund/shared-utils";
import React from "react";
import { StyleSheet, TouchableHighlight } from "react-native";

import {
  baseGray,
  baseWhite,
  baseYellow,
  blueyGray,
  grayLighter2,
  grayLighter4,
  silverLighter1,
  silverLighter2,
  transparent,
  yellowDarker1,
} from "../../../styles/colors";
import { st } from "../../utils";
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
type TBodyBoldTextProps = React.ComponentProps<typeof BodyBoldText>;

type TExternalProps = {
  layout: EButtonLayout;
  loading?: boolean;
  contentStyle?: TBodyBoldTextProps["style"];
} & Omit<TTouchableProps, "activeColor">;

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
  ({ layout, children, style, loading, disabled, contentStyle, ...props }, ref) => {
    const buttonStyle = getButtonStyle(layout);

    const isDisabled = disabled || loading;

    return (
      <Touchable
        ref={ref}
        style={st(
          styles.buttonCommon,
          buttonStyle.button,
          [isDisabled, [styles.buttonCommonDisabled, buttonStyle.buttonDisabled]],
          style,
        )}
        activeColor={yellowDarker1}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        {...props}
      >
        <BodyBoldText
          style={st(
            styles.buttonCommonLabel,
            buttonStyle.label,
            [isDisabled, [styles.buttonCommonDisabledLabel, buttonStyle.labelDisabled]],
            contentStyle,
          )}
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
    color: blueyGray,
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
    borderColor: transparent,
    backgroundColor: transparent,
  },
  buttonTextDisabled: {
    borderColor: transparent,
    backgroundColor: transparent,
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
