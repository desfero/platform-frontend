import * as React from "react";
import { StyleSheet, View } from "react-native";

import { baseGray } from "../../../styles/colors";
import { spacingStyles } from "../../../styles/spacings";
import { EIconType, Icon } from "../../shared/Icon";
import { Button, EButtonLayout } from "../../shared/buttons/Button";
import { Headline } from "../../shared/typography/Headline";

type TExternalProps = {
  headline: string;
  icon: EIconType;
  approve: () => void;
  reject: () => void;
};

const SignerContainer: React.FunctionComponent<TExternalProps> = ({
  headline,
  icon,
  approve,
  reject,
  children,
}) => (
  <>
    <View style={styles.container}>
      <Icon type={icon} style={styles.icon} />

      <Headline style={styles.headline} level={3}>
        {headline}
      </Headline>

      {children}
    </View>

    <Button layout={EButtonLayout.PRIMARY} style={styles.acceptButton} onPress={approve}>
      Confirm
    </Button>
    <Button layout={EButtonLayout.TEXT} onPress={reject}>
      Reject
    </Button>
  </>
);

const styles = StyleSheet.create({
  container: { ...spacingStyles.mv4, alignItems: "center" },
  icon: {
    ...spacingStyles.mb3,

    color: baseGray,
    width: 48,
    height: 48,
  },
  headline: {
    ...spacingStyles.mb3,

    color: baseGray,
  },
  acceptButton: {
    ...spacingStyles.mb1,
  },
});

export { SignerContainer };
