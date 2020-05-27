import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";

import { baseGray, baseGreen, baseWhite } from "../../../styles/colors";
import { roundness, shadowStyles } from "../../../styles/common";
import { spacing2, spacingStyles } from "../../../styles/spacings";
import { typographyStyles } from "../../../styles/typography";
import { Panel } from "../../shared/panel/Panel";
import { Headline } from "../../shared/typography/Headline";
import { HelperText } from "../../shared/typography/HelperText";

type TEtoCardProps = {
  categories: string[];
  companyThumbnail: ImageSourcePropType;
  companyName: string;
  etoState: string;
  onPress: () => void;
};

const EtoCard: React.FunctionComponent<TEtoCardProps & React.ComponentProps<typeof Panel>> = ({
  categories,
  companyThumbnail,
  companyName,
  etoState,
  onPress,
  style,
  ...props
}) => (
  <TouchableHighlight underlayColor="transparent" onPress={onPress} {...props}>
    <View style={[styles.wrapper, style]}>
      <View style={styles.companyThumbnailWrapper}>
        <Image
          source={companyThumbnail}
          style={styles.companyThumbnail}
          accessibilityIgnoresInvertColors
        />

        <View style={styles.categories}>
          {categories.map(category => (
            <Text key={category} style={styles.category}>
              {category}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.stateRow}>
          <View style={styles.stateIndicator} />
          <HelperText style={styles.stateName}>{etoState}</HelperText>
        </View>

        <View>
          <Headline level={3}>{companyName}</Headline>
        </View>
      </View>
    </View>
  </TouchableHighlight>
);

const styles = StyleSheet.create({
  wrapper: {
    ...shadowStyles.s2,
    borderRadius: roundness,
    backgroundColor: baseWhite,
  },
  companyThumbnail: {
    width: "100%",
    borderRadius: roundness,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    height: 237,
  },
  categories: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "flex-end",
    bottom: spacing2,
    left: spacing2,
    right: spacing2,
  },
  category: {
    ...typographyStyles.helperText,
    padding: 2,
    ...spacingStyles.ph2,
    ...spacingStyles.ml2,
    backgroundColor: baseGray,
    borderRadius: 10,
    color: baseWhite,
    overflow: "hidden",
  },
  stateRow: {
    ...spacingStyles.mb2,
    flexDirection: "row",
    alignItems: "center",
  },
  body: {
    ...spacingStyles.p4,
  },
  stateName: {
    ...spacingStyles.ml2,
    ...typographyStyles.menuLabelBold,
    textTransform: "uppercase",
  },
  stateIndicator: {
    width: 8,
    height: 8,
    backgroundColor: baseGreen,
    borderRadius: 4,
  },
  companyThumbnailWrapper: {
    position: "relative",
  },
});

export { EtoCard };
