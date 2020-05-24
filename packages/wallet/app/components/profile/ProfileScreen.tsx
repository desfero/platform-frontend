import { nonNullable } from "@neufund/shared-utils";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text } from "react-native";
import Config from "react-native-config";

import { EAppRoutes } from "../../appRoutes";
import { authModuleAPI } from "../../modules/auth/module";
import { walletConnectModuleApi } from "../../modules/wallet-connect/module";
import { appConnect } from "../../store/utils";
import { EIconType } from "../shared/Icon";
import { SafeAreaScreen } from "../shared/Screen";
import { Button, EButtonLayout } from "../shared/buttons/Button";
import { Menu, EMenuItemType } from "../shared/menu/Menu";
import { Header } from "./header/Header";

type TStateProps = {
  authWallet: NonNullable<ReturnType<typeof authModuleAPI.selectors.selectAuthWallet>>;
  walletConnectPeer: ReturnType<typeof walletConnectModuleApi.selectors.selectWalletConnectPeer>;
};

type TDispatchProps = {
  logout: () => void;
  walletConnectDisconnect: (peerId: string) => void;
};

type TMenuProps = React.ComponentProps<typeof Menu>;

const ProfileLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  authWallet,
  walletConnectPeer,
  walletConnectDisconnect,
  logout,
}) => {
  const navigation = useNavigation();

  const items = React.useMemo(() => {
    const defaultItems: TMenuProps["items"] = [];

    if (Config.NF_CONTRACT_ARTIFACTS_VERSION === "localhost") {
      return defaultItems.concat([
        {
          id: "switch-account",
          type: EMenuItemType.BUTTON,
          heading: "Switch account",
          helperText: authWallet.name,
          icon: EIconType.WALLET,
          onPress: () => navigation.navigate(EAppRoutes.switchAccount),
        },
      ]);
    }

    return defaultItems;
  }, [authWallet, navigation]);

  return (
    <SafeAreaScreen forceTopInset={true}>
      <Header name={authWallet.name} address={authWallet.address} />

      <Menu items={items} />

      <Text>Wallet connect peer: </Text>
      {walletConnectPeer ? (
        <>
          {/* eslint-disable-next-line @typescript-eslint/no-magic-numbers */}
          <Text>{JSON.stringify(walletConnectPeer, undefined, 2)}</Text>
          <Button
            layout={EButtonLayout.PRIMARY}
            onPress={() => walletConnectDisconnect(walletConnectPeer.id)}
          >
            Disconnect
          </Button>
        </>
      ) : (
        <Text>not connected</Text>
      )}

      <Button layout={EButtonLayout.TEXT} testID="dashboard.logout" onPress={logout}>
        Logout
      </Button>
    </SafeAreaScreen>
  );
};

const ProfileScreen = appConnect<TStateProps, TDispatchProps>({
  stateToProps: state => ({
    authWallet: nonNullable(authModuleAPI.selectors.selectAuthWallet(state)),
    walletConnectPeer: walletConnectModuleApi.selectors.selectWalletConnectPeer(state),
  }),
  dispatchToProps: dispatch => ({
    walletConnectDisconnect: (peerId: string) =>
      dispatch(walletConnectModuleApi.actions.disconnectFromPeer(peerId)),
    logout: () => dispatch(authModuleAPI.actions.logout()),
  }),
})(ProfileLayout);

export { ProfileScreen };
