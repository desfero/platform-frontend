import { useNavigation } from "@react-navigation/native";
import React from "react";
import SafeAreaView from "react-native-safe-area-view";
import { StyleSheet, View } from "react-native";

import { appRoutes } from "../../appRoutes";
import NeufundLogo from "../../assets/neufund-logo.svg";
import { baseSilver } from "../../styles/colors";
import { spacingStyles } from "../../styles/spacings";
import { ButtonIcon } from "../shared/buttons/ButtonIcon";
import { EIconType } from "../shared/Icon";

const Header: React.FunctionComponent = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView forceInset={{ top: "always" }}>
      <View style={styles.header}>
        <NeufundLogo title="Neufund" width={132} height={32} />

        <ButtonIcon
          icon={EIconType.PLACEHOLDER}
          accessibilityLabel="Scan QR code"
          testID="home.header.go-to-qr-code-scanner"
          onPress={() => navigation.navigate(appRoutes.qrCode)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    ...spacingStyles.ph4,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderBottomColor: baseSilver,
    borderBottomWidth: 1,
  },
});

export { Header };
