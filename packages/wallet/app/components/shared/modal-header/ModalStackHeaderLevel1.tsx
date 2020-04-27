import { StackActions } from "@react-navigation/native";
import { StackHeaderProps } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View } from "react-native";

import { black } from "../../../styles/colors";
import { spacingStyles } from "../../../styles/spacings";
import { getTopPadding } from "../../../styles/utils";
import { EIconType } from "../Icon";
import { ButtonIcon } from "../buttons/ButtonIcon";
import { EHeadlineLevel, Headline } from "../typography/Headline";

/**
 * A modal stack header that aligns with our design system.
 */
const ModalStackHeaderLevel1: React.FunctionComponent<StackHeaderProps> = ({
  scene,
  insets,
  previous,
  navigation,
}) => {
  const { options } = scene.descriptor;

  const statusBarHeight = options.headerStatusBarHeight ?? insets.top;

  const goBack = () => {
    if (navigation.isFocused() && navigation.canGoBack()) {
      navigation.dispatch({
        ...StackActions.pop(),
        source: scene.route.key,
      });
    }
  };

  return (
    <View
      style={{ ...styles.container, paddingTop: getTopPadding(styles.container) + statusBarHeight }}
    >
      {previous && (
        <ButtonIcon
          icon={EIconType.CLOSE}
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
          onPress={goBack}
        />
      )}
      <Headline
        style={styles.header}
        level={EHeadlineLevel.LEVEL2}
        accessibilityRole="header"
        numberOfLines={1}
      >
        {options.title}
      </Headline>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...spacingStyles.pt2,
    alignItems: "flex-start",
  },
  header: {
    ...spacingStyles.mt2,
    ...spacingStyles.mh4,

    color: black,
  },
});

export { ModalStackHeaderLevel1 };
