import { toEquityTokenSymbol } from "@neufund/shared-utils";
import React from "react";
import { StyleSheet } from "react-native";

import { HeaderScreen } from "components/shared/HeaderScreen";
import { Asset, EAssetType } from "components/shared/asset/Asset";

import { spacingStyles } from "styles/spacings";

const PortfolioScreen: React.FunctionComponent = () => (
  <HeaderScreen heading={"€6 500.00"} subHeading={"Portfolio balance"}>
    <Asset
      tokenImage="https://documents.neufund.io/0x95137084d1b6F58D177523De894293913394aA12/9066455f-e514-444d-bd4f-44e4df3f2a74.png"
      name="Nomera Tech"
      token={toEquityTokenSymbol("NOM")}
      balance="1000"
      analogBalance="15 000"
      analogToken={toEquityTokenSymbol("EUR")}
      style={styles.asset}
      type={EAssetType.RESERVED}
    />

    {Array.from({ length: 15 }, (_, i) => i).map(i => (
      <Asset
        key={i}
        tokenImage="https://documents.neufund.io/0x74180B56DD74BC56a2E9D5720F39247c55F23328/e36ee175-e8c6-4f8a-9175-1e22b0a8be53.png"
        name="Greyp"
        token={toEquityTokenSymbol("GRP")}
        balance="100"
        analogBalance="1 000"
        analogToken={toEquityTokenSymbol("EUR")}
        style={styles.asset}
        type={EAssetType.NORMAL}
      />
    ))}
  </HeaderScreen>
);

const styles = StyleSheet.create({
  asset: {
    ...spacingStyles.mh4,
    ...spacingStyles.mb2,
  },
});

export { PortfolioScreen };
