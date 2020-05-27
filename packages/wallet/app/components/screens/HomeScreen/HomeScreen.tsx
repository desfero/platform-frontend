import { toEquityTokenSymbol } from "@neufund/shared-utils";
import React from "react";
import { StyleSheet } from "react-native";

import emfluxmotorsBanner from "../../../assets/images/emfluxmotors.png";
import greypBanner from "../../../assets/images/greyp.png";
import icbmBanner from "../../../assets/images/icbm.png";
import myswooopBanner from "../../../assets/images/myswooop.png";
import neufundBanner from "../../../assets/images/neufund.png";
import ngraveBanner from "../../../assets/images/ngrave.png";
import nuCaoBanner from "../../../assets/images/nucao.png";
import { EAppRoutes } from "../../../router/appRoutes";
import { useNavigationTyped } from "../../../router/routeUtils";
import { appConnect } from "../../../store/utils";
import { spacingStyles } from "../../../styles/spacings";
import { EIconType } from "../../shared/Icon";
import { SafeAreaScreen } from "../../shared/Screen";
import { Asset, EAssetType } from "../../shared/asset/Asset";
import { EtoCard } from "./EtoCard";
import { Header } from "./Header";
import { Section } from "./Section";

type TStateProps = {};

const HomeLayout: React.FunctionComponent<TStateProps> = () => {
  const navigation = useNavigationTyped();
  const onEtoCardPress = (uri: string) => {
    navigation.navigate(EAppRoutes.webView, { uri });
  };

  return (
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
            name="nEur"
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

        <Section heading="Investment Opportunities" style={styles.section}>
          <EtoCard
            etoState="Coming Soon"
            companyName="the nu company"
            style={styles.etoCard}
            companyThumbnail={nuCaoBanner}
            categories={["Impact", "Food"]}
            onPress={() =>
              onEtoCardPress(
                "https://platform.neufund.org/eto/view/LI/7900e7fe-8fdf-4930-9798-1bc267f05b2b",
              )
            }
          />
          <EtoCard
            etoState="Proceeds Payout"
            companyName="Grey (GRP)"
            style={styles.etoCard}
            companyThumbnail={greypBanner}
            categories={["Light Electric Vehicles", "Smart Mobility"]}
            onPress={() =>
              onEtoCardPress(
                "https://platform.neufund.org/eto/view/LI/1eb004fd-c44d-4bed-9e76-0e0858649587",
              )
            }
          />
          <EtoCard
            etoState="Proceeds Payout"
            companyName="Neufund (FTH)"
            style={styles.etoCard}
            companyThumbnail={neufundBanner}
            categories={["Technology", "Blockchain"]}
            onPress={() =>
              onEtoCardPress(
                "https://platform.neufund.org/eto/view/DE/efbfc858-0f29-4351-8d07-850b1e0461b8",
              )
            }
          />
          <EtoCard
            etoState="Proceeds Payout"
            companyName="Emuflux Motors"
            style={styles.etoCard}
            companyThumbnail={emfluxmotorsBanner}
            categories={["Mobility", "India"]}
            onPress={() => onEtoCardPress("http://www.emfluxmotors.com/")}
          />
          <EtoCard
            etoState="Coming Soon"
            companyName="My Swoop"
            style={styles.etoCard}
            companyThumbnail={myswooopBanner}
            categories={["Re-commerce", "Germany"]}
            onPress={() => onEtoCardPress("https://www.myswooop.de/")}
          />
          <EtoCard
            etoState="Coming Soon"
            companyName="Ngrave"
            style={styles.etoCard}
            companyThumbnail={ngraveBanner}
            categories={["Blockchain", "Belgium"]}
            onPress={() => onEtoCardPress("https://www.ngrave.io/")}
          />
          <EtoCard
            etoState="Success"
            companyName="NEUFUND ICBM Capital Raise"
            style={styles.etoCard}
            companyThumbnail={icbmBanner}
            categories={["Technology", "Blockchain"]}
            onPress={() => onEtoCardPress("https://commit.neufund.org/")}
          />
        </Section>
      </SafeAreaScreen>
    </>
  );
};

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
  etoCard: {
    ...spacingStyles.mb4,
  },
});

const HomeScreen = appConnect<TStateProps>({
  stateToProps: () => ({}),
})(HomeLayout);

export { HomeScreen };
