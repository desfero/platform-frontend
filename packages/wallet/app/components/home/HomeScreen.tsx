import { toEquityTokenSymbol } from "@neufund/shared-utils";
import React from "react";
import { StyleSheet } from "react-native";

import { appConnect } from "../../store/utils";
import { spacingStyles } from "../../styles/spacings";
import { EIconType } from "../shared/Icon";
import { SafeAreaScreen } from "../shared/Screen";
import { Asset, EAssetType } from "../shared/asset/Asset";
import { Header } from "./Header";
import { Section } from "./Section";

type TStateProps = {};

const HomeLayout: React.FunctionComponent<TStateProps> = () => (
  <>
    <Header />
    <SafeAreaScreen style={styles.container}>
      <Section heading="Portfolio" subHeading="€6 500.00" style={styles.section}>
        <Asset
          tokenImage="https://documents.neufund.io/0x95137084d1b6F58D177523De894293913394aA12/9066455f-e514-444d-bd4f-44e4df3f2a74.png"
          name="Nomera Tech"
          token={toEquityTokenSymbol("NOM")}
          balance="100"
          analogBalance="1 000"
          analogToken={toEquityTokenSymbol("EUR")}
          style={styles.asset}
          type={EAssetType.NORMAL}
        />

        <Asset
          tokenImage="https://documents.neufund.io/0x74180B56DD74BC56a2E9D5720F39247c55F23328/e36ee175-e8c6-4f8a-9175-1e22b0a8be53.png"
          name="Fifth Force"
          token={toEquityTokenSymbol("FFT")}
          balance="1000"
          analogBalance="15 000"
          analogToken={toEquityTokenSymbol("EUR")}
          style={styles.asset}
          type={EAssetType.NORMAL}
        />
      </Section>

      <Section heading="Wallet" subHeading="€2 318.28" style={styles.section}>
        <Asset
          tokenImage={EIconType.N_EUR}
          name="nEUR"
          token={toEquityTokenSymbol("nEUR")}
          balance="1000"
          analogBalance="1000"
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
      </Section>
    </SafeAreaScreen>
  </>
);

const styles = StyleSheet.create({
  container: {
    ...spacingStyles.pv5,
  },
  section: {
    ...spacingStyles.ph4,
    ...spacingStyles.mb4,
  },
  asset: {
    ...spacingStyles.mb2,
  },
});

const HomeScreen = appConnect<TStateProps>({
  stateToProps: () => ({}),
})(HomeLayout);

export { HomeScreen };
