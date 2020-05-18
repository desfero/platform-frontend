import * as React from "react";
import {
  Platform,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  View,
  TouchableHighlight,
} from "react-native";

import { ANDROID_VERSION_LOLLIPOP } from "../../config/constants";

type TExternalProps = React.ComponentProps<typeof TouchableWithoutFeedback> & {
  activeColor: string;
  children: React.ReactNode;
};

const isRippleSupported = Platform.OS === "android" && Platform.Version >= ANDROID_VERSION_LOLLIPOP;

/**
 * A wrapper for components that should respond to touches.
 * Provides a material "ink ripple" interaction effect for supported platforms (>= Android Lollipop).
 * On unsupported platforms, it falls back to a highlight effect.
 */
const Touchable = React.forwardRef<TouchableHighlight, TExternalProps>(
  ({ children, style, activeColor, ...props }, ref) => {
    if (isRippleSupported) {
      // TODO: There is a bug in react-native were ripple effect do not follow the borderRadius
      // see https://github.com/facebook/react-native/issues/6480
      return (
        <TouchableNativeFeedback
          ref={ref}
          background={TouchableNativeFeedback.Ripple(activeColor)}
          {...props}
        >
          <View style={style}>{React.Children.only(children)}</View>
        </TouchableNativeFeedback>
      );
    }

    // TODO: There is a bug in react-native were active styles are not removed until animation is done when button is moving from enabled to disabled state
    //       Therefore for now we just force to remount component
    return (
      <TouchableHighlight
        key={props.disabled ? "refresh" : undefined}
        ref={ref}
        activeOpacity={1}
        underlayColor={activeColor}
        style={style}
        {...props}
      >
        {React.Children.only(children)}
      </TouchableHighlight>
    );
  },
);

export { Touchable };
