import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { FormattedDate } from "react-intl";
import { StyleSheet } from "react-native";

import { appRoutes } from "../../appRoutes";
import { externalRoutes } from "../../config/externalRoutes";
import { walletConnectModuleApi } from "../../modules/wallet-connect/module";
import { appConnect } from "../../store/utils";
import { baseRed, grayLighter2 } from "../../styles/colors";
import { spacingStyles } from "../../styles/spacings";
import { Link } from "../shared/Link";
import { SafeAreaScreen } from "../shared/Screen";
import { Button, EButtonLayout } from "../shared/buttons/Button";
import { BodyText } from "../shared/typography/BodyText";
import { Section } from "./Section";

type TStateProps = {
  walletConnectPeer: ReturnType<typeof walletConnectModuleApi.selectors.selectWalletConnectPeer>;
};

type TDispatchProps = {
  walletConnectDisconnect: (peerId: string) => void;
};

const WalletConnectLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  walletConnectPeer,
  walletConnectDisconnect,
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaScreen contentContainerStyle={styles.content}>
      {walletConnectPeer ? (
        <>
          <Section
            label="Session active since"
            value={
              <FormattedDate
                value={walletConnectPeer.connectedAt}
                year="numeric"
                month="numeric"
                day="numeric"
                hour="numeric"
                minute="numeric"
              />
            }
          />

          <Button
            style={styles.disconnectButton}
            contentStyle={styles.disconnectButtonContent}
            layout={EButtonLayout.SECONDARY}
            onPress={() => walletConnectDisconnect(walletConnectPeer.id)}
          >
            Cancel session
          </Button>
        </>
      ) : (
        <>
          <BodyText style={styles.noSessionTex}>
            Browse to{" "}
            <Link url={externalRoutes.platformWalletConnect}>
              {externalRoutes.platformWalletConnect}
            </Link>{" "}
            on your desktop or tablet and scan the QR code to use Neufund Web with your account.
          </BodyText>

          <Button
            layout={EButtonLayout.PRIMARY}
            testID="wallet-connect-session-screen.scan-qr"
            onPress={() => navigation.navigate(appRoutes.qrCode)}
          >
            Scan QR code
          </Button>
        </>
      )}
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    ...spacingStyles.p4,
  },
  disconnectButton: {
    ...spacingStyles.mt5,
  },
  disconnectButtonContent: {
    color: baseRed,
  },
  noSessionTex: {
    ...spacingStyles.mb5,
    color: grayLighter2,
  },
});

const WalletConnectSessionScreen = appConnect<TStateProps, TDispatchProps>({
  stateToProps: state => ({
    walletConnectPeer: walletConnectModuleApi.selectors.selectWalletConnectPeer(state),
  }),
  dispatchToProps: dispatch => ({
    walletConnectDisconnect: (peerId: string) =>
      dispatch(walletConnectModuleApi.actions.disconnectFromPeer(peerId)),
  }),
})(WalletConnectLayout);

export { WalletConnectSessionScreen };
