import { storiesOf } from "@storybook/react";
import * as React from "react";

import { BankAccount } from "./BankAccount";

storiesOf("BankAccount", module)
  .add("default", () => (
    <BankAccount
      details={{
        bankAccountNumberLast4: "1234",
        bankName: "mBank",
        name: "Lorem Ipsum",
        isSepa: true,
        swiftCode: "33212",
      }}
    />
  ))
  .add("with border", () => (
    <BankAccount
      details={{
        bankAccountNumberLast4: "1234",
        bankName: "mBank",
        name: "Lorem Ipsum",
        isSepa: true,
        swiftCode: "33212",
      }}
      withBorder={true}
    />
  ));
