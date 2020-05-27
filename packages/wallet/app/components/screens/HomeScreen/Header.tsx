import React from "react";
import { StyleSheet, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";

import NeufundLogo from "assets/neufund-logo.svg";

import { EIconType } from "components/shared/Icon";
import { ButtonIcon } from "components/shared/buttons/ButtonIcon";

import { EAppRoutes } from "router/appRoutes";
import { useNavigationTyped } from "router/routeUtils";

import { baseSilver } from "styles/colors";
import { spacingStyles } from "styles/spacings";

const Header: React.FunctionComponent = () => {
  const navigation = useNavigationTyped();

  return (
    <SafeAreaView forceInset={{ top: "always", bottom: "never" }}>
      <View style={styles.header}>
        <NeufundLogo title="Neufund" width={132} height={32} />

        <ButtonIcon
          icon={EIconType.QR_CODE}
          accessibilityLabel="Scan QR code"
          accessibilityHint="Opens a qr code scanner"
          testID="home.header.go-to-qr-code-scanner"
          onPress={() => navigation.navigate(EAppRoutes.qrCode)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    ...spacingStyles.pl4,
    ...spacingStyles.pr2,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderBottomColor: baseSilver,
    borderBottomWidth: 1,
  },
});

export { Header };
