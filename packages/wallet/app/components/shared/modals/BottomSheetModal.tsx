import * as React from "react";
import { View, Animated, StyleSheet, useWindowDimensions, SafeAreaView } from "react-native";
import { usePrevious } from "../../../hooks/usePrevious";

import { baseWhite } from "../../../styles/colors";
import { spacingStyles } from "../../../styles/spacings";

type TExternalProps = {
  isVisible: boolean;
};

const BottomSheetModal: React.FunctionComponent<TExternalProps> = ({ children, isVisible }) => {
  const progressRef = React.useRef(new Animated.Value(0));

  const wasVisible = usePrevious(isVisible);

  React.useEffect(() => {
    const showAnimation = Animated.timing(progressRef.current, {
      duration: 10000,
      useNativeDriver: true,
      toValue: 1,
    });

    const hideAnimation = Animated.timing(progressRef.current, {
      duration: 10000,
      useNativeDriver: true,
      toValue: 0,
    });

    if (!wasVisible && isVisible) {
      showAnimation.start();
    }

    if (wasVisible && !isVisible) {
      hideAnimation.start();
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
          inputRange: [0.01, 1],
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
      style={[styles.cover, backdrop]}
    >
      <Animated.View style={[styles.sheet, slideUp]}>
        <View style={styles.content} pointerEvents="box-none">
          <SafeAreaView>{children}</SafeAreaView>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cover: {
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
