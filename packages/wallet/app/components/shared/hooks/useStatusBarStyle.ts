import { assertNever } from "@neufund/shared-utils";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { Platform, StatusBar, StatusBarStyle } from "react-native";

import { baseWhite, darkBlueGray1 } from "../../../styles/colors";

enum EStatusBarStyle {
  WHITE = "white",
  DARK_BLUEY_GRAY = "dark_bluey_gray",
}

type TStatusBarOptions = { style: StatusBarStyle; backgroundColor: string };

const getStatusBarEffectOptions = (statusBarStyle: EStatusBarStyle): TStatusBarOptions => {
  switch (statusBarStyle) {
    case EStatusBarStyle.WHITE:
      return {
        style: "dark-content",
        backgroundColor: baseWhite,
      };
    case EStatusBarStyle.DARK_BLUEY_GRAY:
      return {
        style: "light-content",
        backgroundColor: darkBlueGray1,
      };
    default:
      assertNever(statusBarStyle, "Invalid status bar style received");
  }
};

/**
 * Imperatively manage status bar style and bg color
 */
const useStatusBarStyle = (statusBarStyle: EStatusBarStyle) =>
  useFocusEffect(
    React.useCallback(() => {
      const { backgroundColor, style } = getStatusBarEffectOptions(statusBarStyle);

      StatusBar.setBarStyle(style);

      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor(backgroundColor);
      }
    }, [statusBarStyle]),
  );

export { useStatusBarStyle, EStatusBarStyle };
