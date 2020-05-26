import React from "react";
import { FormattedDate } from "react-intl";
import { GestureResponderEvent, StyleSheet, TouchableOpacity, View } from "react-native";

import { baseGray, baseGreen, blueyGray } from "../../../../styles/colors";
import { spacingStyles } from "../../../../styles/spacings";
import { EIconType, Icon } from "../../../shared/Icon";
import { Money } from "../../../shared/Money";
import { HelperText } from "../../../shared/forms/layouts/HelperText";
import { Text, TextBold } from "../../../shared/typography/Text";
import { st } from "../../../utils";
import { IconSpacer } from "./IconSpacer";
import { ETransactionDirection, TTransaction } from "./types";

type TExternalProps = {
  onPress: (event: GestureResponderEvent) => void;
  icon: EIconType;
} & TTransaction;

const SuccessfulTransaction: React.FunctionComponent<TExternalProps> = ({
  name,
  timestamp,
  value,
  valueToken,
  valueDecimals,
  valueEquivalent,
  valueEquivalentToken,
  valueEquivalentDecimals,
  direction,
  icon,
  onPress,
}) => (
  <TouchableOpacity
    style={st(styles.container)}
    activeOpacity={0.4}
    accessibilityComponentType="button"
    accessibilityTraits="button"
    onPress={onPress}
  >
    <>
      <IconSpacer style={st(styles.spacer)}>
        <Icon style={st(styles.icon)} type={icon} />
      </IconSpacer>

      <View style={st(styles.wrapper)}>
        <View>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>

          <HelperText style={styles.date} numberOfLines={1}>
            <FormattedDate value={timestamp} year="numeric" month="short" day="numeric" />
          </HelperText>
        </View>

        <View>
          <TextBold
            style={st(
              [direction === ETransactionDirection.IN, styles.valueIn],
              [direction === ETransactionDirection.OUT, styles.valueOut],
            )}
            numberOfLines={1}
          >
            {direction === ETransactionDirection.OUT && <>&minus;</>}
            <Money currency={valueToken} value={value} decimalPlaces={valueDecimals} />
          </TextBold>

          {valueEquivalent && valueEquivalentToken && valueEquivalentDecimals && (
            <HelperText style={styles.valueEquivalent} numberOfLines={1}>
              &asymp;{" "}
              <Money
                currency={valueEquivalentToken}
                value={valueEquivalent}
                decimalPlaces={valueEquivalentDecimals}
              />
            </HelperText>
          )}
        </View>
      </View>
    </>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 64,
  },
  spacer: { alignSelf: "center" },
  icon: {
    color: baseGray,
    width: "100%",
    height: "100%",
  },
  wrapper: {
    ...spacingStyles.pr4,

    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    color: baseGray,
  },
  date: {
    color: blueyGray,
  },
  valueIn: {
    color: baseGreen,
  },
  valueOut: {
    color: baseGray,
  },
  valueEquivalent: {
    color: blueyGray,
  },
});

export { SuccessfulTransaction };
