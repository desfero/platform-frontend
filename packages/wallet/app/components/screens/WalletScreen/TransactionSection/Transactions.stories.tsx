import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { MOCK_TRANSACTIONS } from "../constants";
import { Transactions } from "./Transactions";

storiesOf("Organisms|Transactions", module).add("default", () => (
  <Transactions
    transactions={MOCK_TRANSACTIONS.map(transaction => ({
      ...transaction,
      onPress: action("onPress"),
    }))}
  />
));
