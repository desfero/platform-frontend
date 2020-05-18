import { toEquityTokenSymbol } from "@neufund/shared-utils";
import * as React from "react";
import { StyleSheet } from "react-native";

import { spacingStyles } from "../../styles/spacings";
import { HeaderScreen } from "../shared/HeaderScreen";
import { EIconType } from "../shared/Icon";
import { Asset, EAssetType } from "../shared/asset/Asset";

const WalletScreen: React.FunctionComponent = () => (
  <HeaderScreen heading={"€0"} subHeading={"Wallet balance"}>
    <Asset
      tokenImage={EIconType.N_EUR}
      name="nEur"
      token={toEquityTokenSymbol("nEUR")}
      balance="0"
      analogBalance="0"
      analogToken={toEquityTokenSymbol("EUR")}
      style={styles.asset}
      type={EAssetType.NORMAL}
    />

    <Asset
      tokenImage={EIconType.ETH}
      name="Ether"
      token={toEquityTokenSymbol("ETH")}
      balance="0"
      analogBalance="0"
      analogToken={toEquityTokenSymbol("EUR")}
      style={styles.asset}
      type={EAssetType.NORMAL}
    />
  </HeaderScreen>
);

const styles = StyleSheet.create({
  asset: {
    ...spacingStyles.mb2,
    ...spacingStyles.mh4,
  },
});

export { WalletScreen };
