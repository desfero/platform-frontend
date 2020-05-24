import * as React from "react";
import { StyleSheet, View } from "react-native";
import { ESignerType, TSignerRequestData } from "../../modules/signer-ui/types";
import { baseGray, grayLighter2 } from "../../styles/colors";
import { spacingStyles } from "../../styles/spacings";
import { Button, EButtonLayout } from "../shared/buttons/Button";
import { EIconType, Icon } from "../shared/Icon";
import { Text } from "../shared/typography/Text";
import { Headline } from "../shared/typography/Headline";

type TExternalProps = {
  data: TSignerRequestData[ESignerType.WC_SESSION_REQUEST];
  approve: () => void;
  reject: () => void;
};

const WCSessionRequestSigner: React.FunctionComponent<TExternalProps> = ({
  approve,
  reject,
  data,
}) => (
  <>
    <View style={styles.container}>
      <Icon type={EIconType.BACKUP} style={styles.icon} />

      <Headline style={styles.headline} level={3}>
        Connection request
      </Headline>

      <Text style={styles.body}>
        {data.peerName} is requesting to connect to your account via {data.peerUrl}
      </Text>
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
  body: {
    color: grayLighter2,
  },
  acceptButton: {
    ...spacingStyles.mb1,
  },
});

export { WCSessionRequestSigner };
