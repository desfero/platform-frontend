import * as React from "react";
import { View, Animated, StyleSheet, useWindowDimensions, SafeAreaView } from "react-native";
import { usePrevious } from "../../../hooks/usePrevious";

import { baseWhite } from "../../../styles/colors";
import { spacingStyles } from "../../../styles/spacings";

type TExternalProps = {
  isVisible: boolean;
};

const BottomSheetModal: React.FunctionComponent<TExternalProps> = ({ children, isVisible }) => {
  // save previous children value to show while the modal is closing
  // in case the modal content is dynamic
  const previousChildren = usePrevious(children);

  const progressRef = React.useRef(new Animated.Value(0));

  const wasVisible = usePrevious(isVisible);

  React.useEffect(() => {
    if (!wasVisible && isVisible) {
      Animated.timing(progressRef.current, {
        duration: 1000,
        useNativeDriver: true,
        toValue: 1,
      }).start();
    }

    if (wasVisible && !isVisible) {
      Animated.timing(progressRef.current, {
        duration: 10000,
        useNativeDriver: true,
        toValue: 0,
      }).start();
    }
  }, [wasVisible, isVisible]);

  const { height } = useWindowDimensions();

  const backdrop = {
    transform: [
      {
        translateY: progressRef.current.interpolate({
          inputRange: [0, 0.01],
          outputRange: [height, 0],
          extrapolate: "clamp",
        }),
      },
    ],
    opacity: progressRef.current.interpolate({
      inputRange: [0.01, 0.5],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
  };

  const slideUp = {
    transform: [
      {
        translateY: progressRef.current.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -1 * height],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  return (
    <Animated.View
      pointerEvents={isVisible ? "auto" : "none"}
      accessibilityViewIsModal
      accessibilityLiveRegion="polite"
      style={[styles.backdrop, backdrop]}
    >
      <Animated.View style={[styles.sheet, slideUp]}>
        <View style={styles.content} pointerEvents="box-none">
          <SafeAreaView>{children ?? previousChildren}</SafeAreaView>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    ...spacingStyles.p1,

    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "flex-end",
  },
  content: {
    ...spacingStyles.p4,
    backgroundColor: baseWhite,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
});

export { BottomSheetModal };
