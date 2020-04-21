import React from "react";
import { StyleSheet, View } from "react-native";

import { baseGray, silverLighter1 } from "../../../styles/colors";
import { spacing3, spacingStyles } from "../../../styles/spacings";
import { EIconType, Icon } from "../../shared/Icon";
import { EHeadlineLevel, Headline } from "../../shared/typography/Headline";

type TViewProps = React.ComponentProps<typeof View>;

type TExternalProps = { name?: string } & TViewProps;

const ICON_SIZE = 48;

const Avatar: React.FunctionComponent<TExternalProps> = ({ name, style, ...props }) => (
  <View style={[styles.wrapper, style]} {...props}>
    <View style={styles.iconWrapper}>
      <Icon type={EIconType.PROFILE} style={styles.icon} />
    </View>
    {name && (
      <Headline style={styles.name} level={EHeadlineLevel.LEVEL3}>
        {name}
      </Headline>
    )}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  iconWrapper: {
    ...spacingStyles.p3,
    backgroundColor: silverLighter1,
    borderRadius: (ICON_SIZE + spacing3 * 2) / 2,
  },
  icon: {
    color: baseGray,
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  name: {
    ...spacingStyles.mt3,
  },
});

export { Avatar };
