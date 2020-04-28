import React from "react";
import { StyleSheet, View } from "react-native";

import { blueyGray, grayLighter1 } from "../../styles/colors";
import { BodyText } from "../shared/typography/BodyText";
import { Text } from "../shared/typography/Text";

type TViewProps = React.ComponentProps<typeof View>;
type TExternalProps = { label: string; value: React.ReactNode } & TViewProps;

const Section: React.FunctionComponent<TExternalProps> = ({ label, value, ...props }) => (
  <View {...props}>
    <BodyText style={styles.label}>{label}</BodyText>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  label: {
    color: grayLighter1,
  },
  value: {
    color: blueyGray,
  },
});

export { Section };
