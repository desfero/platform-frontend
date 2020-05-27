import { assertNever } from "@neufund/shared-utils";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { baseSilver } from "styles/colors";

import { IconSpacer } from "./IconSpacer";
import { PendingTransaction } from "./PendingTransaction";
import { SuccessfulTransaction } from "./SuccessfulTransaction";

enum ETransactionType {
  SUCCESSFUL = "successful",
  PENDING = "pending",
}

type TTransaction = { id: string } & (
  | ({ type: ETransactionType.SUCCESSFUL } & React.ComponentProps<typeof SuccessfulTransaction>)
  | ({ type: ETransactionType.PENDING } & React.ComponentProps<typeof PendingTransaction>)
);

type TExternalProps = {
  transactions: TTransaction[];
};

type TSeparatorProps = {
  leadingItem: TTransaction;
};

const ItemSeparatorComponent: React.FunctionComponent<TSeparatorProps> = ({ leadingItem }) => {
  if (leadingItem.type === ETransactionType.PENDING) {
    return null;
  }

  return (
    <View style={styles.separator}>
      <IconSpacer />
      <View style={styles.separatorLine} />
    </View>
  );
};

const Transactions: React.FunctionComponent<TExternalProps> = ({ transactions }) => (
  <FlatList
    ItemSeparatorComponent={ItemSeparatorComponent}
    bounces={false}
    overScrollMode="never"
    data={transactions}
    keyExtractor={item => item.id}
    renderItem={({ item }) => {
      switch (item.type) {
        case ETransactionType.SUCCESSFUL:
          return <SuccessfulTransaction {...item} />;
        case ETransactionType.PENDING:
          return <PendingTransaction {...item} />;

        default:
          assertNever(item, "Not supported transaction type");
      }
    }}
  />
);

const styles = StyleSheet.create({
  separator: {
    height: 1,
    flexDirection: "row",
  },
  separatorLine: {
    backgroundColor: baseSilver,
    flex: 1,
  },
});

export { Transactions, ETransactionType };
