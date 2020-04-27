import { nonNullable } from "@neufund/shared-utils";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import Config from "react-native-config";

import { EAppRoutes } from "../../appRoutes";
import { authModuleAPI } from "../../modules/auth/module";
import { walletConnectModuleApi } from "../../modules/wallet-connect/module";
import { appConnect } from "../../store/utils";
import { EIconType } from "../shared/Icon";
import { SafeAreaScreen } from "../shared/Screen";
import { Menu, EMenuItemType } from "../shared/menu/Menu";
import { Header } from "./header/Header";

type TStateProps = {
  authWallet: NonNullable<ReturnType<typeof authModuleAPI.selectors.selectAuthWallet>>;
  walletConnectPeer: ReturnType<typeof walletConnectModuleApi.selectors.selectWalletConnectPeer>;
};

type TDispatchProps = {
  logout: () => void;
};

type TMenuProps = React.ComponentProps<typeof Menu>;

const ProfileLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  authWallet,
  walletConnectPeer,
  logout,
}) => {
  const navigation = useNavigation();

  const items = React.useMemo(() => {
    const defaultItems: TMenuProps["items"] = [
      {
        id: "wallet-connect-session",
        type: EMenuItemType.BUTTON,
        heading: "Neufund Web",
        helperText: walletConnectPeer ? "Connected" : "Not connected",
        icon: EIconType.DEVICE,
        onPress: () => navigation.navigate(appRoutes.walletConnectSession),
      },
    ];

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
        {
          id: "logout-account",
          type: EMenuItemType.BUTTON,
          heading: "Logout",
          icon: EIconType.PLACEHOLDER,
          onPress: logout,
        },
      ]);
    }

    return defaultItems;
  }, [authWallet, navigation, walletConnectPeer]);

  return (
    <SafeAreaScreen forceTopInset={true}>
      <Header name={authWallet.name} address={authWallet.address} />

      <Menu items={items} />
    </SafeAreaScreen>
  );
};

const ProfileScreen = appConnect<TStateProps, TDispatchProps>({
  stateToProps: state => ({
    authWallet: nonNullable(authModuleAPI.selectors.selectAuthWallet(state)),
    walletConnectPeer: walletConnectModuleApi.selectors.selectWalletConnectPeer(state),
  }),
  dispatchToProps: dispatch => ({
    logout: () => dispatch(authModuleAPI.actions.logout()),
  }),
})(ProfileLayout);

export { ProfileScreen };
