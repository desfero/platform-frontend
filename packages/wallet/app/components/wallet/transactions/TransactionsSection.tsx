import React from "react";
import { StyleSheet, View } from "react-native";

import { grayLighter2 } from "../../../styles/colors";
import { spacingStyles } from "../../../styles/spacings";
import { BodyText } from "../../shared/typography/BodyText";
import { EHeadlineLevel, Headline } from "../../shared/typography/Headline";
import { Transactions } from "./Transactions";

type TViewProps = React.ComponentProps<typeof View>;
type TTransactionsProps = React.ComponentProps<typeof Transactions>;

type TExternalProps = { transactions: TTransactionsProps["transactions"] } & TViewProps;

const TransactionSection: React.FunctionComponent<TExternalProps> = ({
  transactions,
  ...props
}) => (
  <View {...props}>
    <Headline style={styles.headline} level={EHeadlineLevel.LEVEL3}>
      Transactions
    </Headline>

    {transactions.length > 0 ? (
      <Transactions transactions={transactions} />
    ) : (
      <BodyText style={styles.noTransactions}>You don’t have any transactions yet.</BodyText>
    )}
  </View>
);

const styles = StyleSheet.create({
  headline: {
    ...spacingStyles.mh4,
    ...spacingStyles.mb2,
  },
  noTransactions: {
    ...spacingStyles.mh4,
    color: grayLighter2,
  },
});

export { TransactionSection };
