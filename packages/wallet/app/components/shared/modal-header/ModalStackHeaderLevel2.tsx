import { StackActions } from "@react-navigation/native";
import { StackHeaderProps } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View } from "react-native";

import { black } from "../../../styles/colors";
import { spacingStyles } from "../../../styles/spacings";
import { getTopPadding } from "../../../styles/utils";
import { EIconType } from "../Icon";
import { LineBreak } from "../LineBreak";
import { ButtonIcon } from "../buttons/ButtonIcon";
import { EHeadlineLevel, Headline } from "../typography/Headline";

const Spacer: React.FunctionComponent = ({ ...props }) => (
  <View style={[styles.spacer]} {...props} />
);

/**
 * A modal stack header that aligns with our design system.
 */
const ModalStackHeaderLevel2: React.FunctionComponent<StackHeaderProps> = ({
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
        <Spacer>
          <ButtonIcon
            icon={EIconType.CLOSE}
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
            onPress={goBack}
          />
        </Spacer>
      )}
      <Headline
        style={styles.header}
        level={EHeadlineLevel.LEVEL3}
        accessibilityRole="header"
        numberOfLines={1}
      >
        {options.title}
      </Headline>
      {/* Add spacer on both sides of headline to keep it always centered */}
      {previous && (
        <Spacer>
          <LineBreak />
        </Spacer>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...spacingStyles.pt2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  header: {
    ...spacingStyles.ph2,
    color: black,
    textAlign: "center",
    flex: 3,
  },
  spacer: {
    flex: 1,
    alignItems: "flex-start",
  },
});

export { ModalStackHeaderLevel2 };
