import { useActionSheet } from "@expo/react-native-action-sheet";
import { EthereumTxHash, toEquityTokenSymbol, toEthereumTxHash } from "@neufund/shared-utils";
import * as React from "react";
import { Linking, StyleSheet } from "react-native";

import { etherscanTxLink } from "../../config/externalRoutes";
import { spacingStyles } from "../../styles/spacings";
import { HeaderScreen } from "../shared/HeaderScreen";
import { EIconType } from "../shared/Icon";
import { Asset, EAssetType } from "../shared/asset/Asset";
import { MOCK_TRANSACTIONS } from "./constants";
import { TransactionSection } from "./transactions/TransactionsSection";

const WalletScreen: React.FunctionComponent = () => {
  const { showActionSheetWithOptions } = useActionSheet();

  const showActionSheet = (txHash: EthereumTxHash) => {
    const viewOnEtherscan = "View on Etherscan";
    const cancel = "Cancel";

    const options = [viewOnEtherscan, cancel];
    const cancelButtonIndex = options.indexOf(cancel);

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async buttonIndex => {
        if (buttonIndex === options.indexOf(viewOnEtherscan)) {
          await Linking.openURL(etherscanTxLink(txHash));
        }
      },
    );
  };

  return (
    <HeaderScreen heading={"€0"} subHeading={"Wallet balance"}>
      <Asset
        tokenImage={EIconType.N_EUR}
        name="nEUR"
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

      <TransactionSection
        style={styles.transactions}
        transactions={MOCK_TRANSACTIONS.map(transaction => ({
          ...transaction,
          onPress: () =>
            showActionSheet(
              toEthereumTxHash(
                "0x438db1cd907cef39635aa97bdbd8f036b9dcd41805401826c22131bf055a754b",
              ),
            ),
        }))}
      />
    </HeaderScreen>
  );
};

const styles = StyleSheet.create({
  asset: {
    ...spacingStyles.mb2,
    ...spacingStyles.mh4,
  },
  transactions: {
    ...spacingStyles.mt4,
  },
});

export { WalletScreen };
