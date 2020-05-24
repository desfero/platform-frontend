import * as React from "react";
import { View, Animated, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";

import { baseWhite } from "../../../styles/colors";
import { spacingStyles } from "../../../styles/spacings";
import { BaseAnimation } from "../animations/BaseAnimation";

type TExternalProps = {
  isVisible: boolean;
};

const BottomSheetModal: React.FunctionComponent<TExternalProps> = ({ isVisible, ...rest }) => {
  const { height } = useWindowDimensions();
  const { bottom } = useSafeArea();

  return (
    <BaseAnimation
      isActive={isVisible}
      render={({ progress, memoizedChildren }) => {
        const backdrop = {
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 0.01],
                outputRange: [height, 0],
                extrapolate: "clamp",
              }),
            },
          ],
          opacity: progress.interpolate({
            inputRange: [0.01, 0.5],
            outputRange: [0, 1],
            extrapolate: "clamp",
          }),
        };

        const slideUp = {
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -1 * height],
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
            <Animated.View style={[styles.sheet, slideUp, { height }]}>
              <View style={[styles.content, { paddingBottom: bottom }]} pointerEvents="box-none">
                {memoizedChildren}
              </View>
            </Animated.View>
          </Animated.View>
        );
      }}
      {...rest}
    />
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
