import React from "react";
import { FormattedDate } from "react-intl";
import {
  Animated,
  Easing,
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { baseGray, baseGreen, baseSilver, blueyGray } from "../../../../styles/colors";
import { spacingStyles } from "../../../../styles/spacings";
import { EIconType, Icon } from "../../../shared/Icon";
import { Money } from "../../../shared/Money";
import { HelperText } from "../../../shared/forms/layouts/HelperText";
import { Text, TextBold } from "../../../shared/typography/Text";
import { st } from "../../../utils";
import { Badge, EBadgeType } from "./Badge";
import { IconSpacer } from "./IconSpacer";
import { ETransactionDirection, TTransaction } from "./types";

type TExternalProps = {
  onPress: (event: GestureResponderEvent) => void;
} & TTransaction;

const PendingTransaction: React.FunctionComponent<TExternalProps> = ({
  name,
  timestamp,
  value,
  valueToken,
  valueDecimals,
  valueEquivalent,
  valueEquivalentToken,
  valueEquivalentDecimals,
  direction,
  onPress,
}) => {
  const progressRef = React.useRef(new Animated.Value(0));

  React.useEffect(() => {
    const startAnimation = () => {
      const animation = Animated.timing(progressRef.current, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      });

      Animated.loop(animation).start();
    };

    startAnimation();
  }, []);

  const rotate = progressRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <TouchableOpacity
      style={st(styles.container)}
      activeOpacity={0.4}
      accessibilityComponentType="button"
      accessibilityTraits="button"
      onPress={onPress}
    >
      <>
        <IconSpacer style={st(styles.spacer, { transform: [{ rotate }] })}>
          <Icon style={[st(styles.icon)]} type={EIconType.PENDING} />
        </IconSpacer>

        <View style={st(styles.wrapper)}>
          <View>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>

            <View style={styles.dateAndBadgeWrapper}>
              <HelperText style={styles.date} numberOfLines={1}>
                <FormattedDate value={timestamp} year="numeric" month="short" day="numeric" />
              </HelperText>
              <Badge type={EBadgeType.PENDING}>Pending</Badge>
            </View>
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
                &asymp;&nbsp;
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
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: baseSilver,
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
  dateAndBadgeWrapper: {
    alignItems: "center",
    flexDirection: "row",
  },
  date: {
    ...spacingStyles.mr1,

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

export { PendingTransaction };
