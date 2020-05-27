import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import React from "react";
import { StyleSheet, View } from "react-native";

import { spacingStyles } from "styles/spacings";

import { AddressShare } from "./AddressShare";
import { Avatar } from "./Avatar";

type TEexternalProps = {
  name: string | undefined;
  address: EthereumAddressWithChecksum;
};

const Header: React.FunctionComponent<TEexternalProps> = ({ name, address }) => (
  <View style={styles.menuHeader}>
    <Avatar name={name} />

    <AddressShare address={address} style={styles.addressShare} />
  </View>
);

const styles = StyleSheet.create({
  menuHeader: {
    ...spacingStyles.mh4,
    ...spacingStyles.mv5,
  },
  addressShare: {
    ...spacingStyles.mt5,
  },
});

export { Header };
