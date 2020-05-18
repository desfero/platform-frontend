import * as React from "react";
import { Animated, Easing, StyleSheet } from "react-native";

import { darkBlueGray2 } from "../../styles/colors";

type TExternalProps = React.ComponentProps<typeof Animated.View>;

const INDICATOR_SIZE = 16;

/**
 * A loading indicator that aligns with our design system.
 * @note Should be used in place of native `ActivityIndicator`
 */
const LoadingIndicator: React.FunctionComponent<TExternalProps> = ({ style, ...props }) => {
  const progressRef = React.useRef(new Animated.Value(0));

  React.useEffect(() => {
    const startAnimation = () => {
      const animation = Animated.timing(progressRef.current, {
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
        toValue: 1,
      });

      Animated.loop(animation).start();
    };

    startAnimation();
  }, []);

  const pulse = {
    transform: [
      {
        scale: progressRef.current,
      },
    ],
    opacity: progressRef.current.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
  };

  return <Animated.View style={[pulse, styles.loadingIndicator, style]} {...props} />;
};

const styles = StyleSheet.create({
  loadingIndicator: {
    height: INDICATOR_SIZE,
    width: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: darkBlueGray2,
  },
});

export { LoadingIndicator };
