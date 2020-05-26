import React from "react";
import { StyleSheet, View } from "react-native";

import { spacingStyles } from "../../../styles/spacings";
import { EHeadlineLevel, Headline } from "../../shared/typography/Headline";

type TExternalProps = {
  heading: string;
  subHeading?: string;
} & React.ComponentProps<typeof View>;

const Section: React.FunctionComponent<TExternalProps> = ({
  heading,
  subHeading,
  children,
  ...props
}) => (
  <View {...props}>
    <View style={styles.header}>
      <Headline level={EHeadlineLevel.LEVEL3}>{heading}</Headline>
      {subHeading && <Headline level={EHeadlineLevel.LEVEL4}>{subHeading}</Headline>}
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  header: {
    ...spacingStyles.mb2,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export { Section };
