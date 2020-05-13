import { ENEURWalletStatus } from "@neufund/shared-modules";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { LinkedBankAccountLayout } from "./LinkedBankAccountWidget";

storiesOf("LinkedBankAccountWidget", module)
  .add("not verified", () => (
    <LinkedBankAccountLayout
      verifyBankAccount={action("verify")}
      isBankAccountVerified={false}
      bankAccount={undefined}
      neurStatus={ENEURWalletStatus.ENABLED}
    />
  ))
  .add("not verified and blocked to start", () => (
    <LinkedBankAccountLayout
      verifyBankAccount={action("verify")}
      isBankAccountVerified={false}
      bankAccount={undefined}
      neurStatus={ENEURWalletStatus.DISABLED_NON_VERIFIED}
    />
  ))
  .add("verified", () => (
    <LinkedBankAccountLayout
      isBankAccountVerified={true}
      neurStatus={ENEURWalletStatus.ENABLED}
      verifyBankAccount={action("verify")}
      bankAccount={{
        hasBankAccount: true,
        details: {
          bankAccountNumberLast4: "1234",
          bankName: "mBank",
          name: "Lorem Ipsum",
          isSepa: true,
          swiftCode: "33212",
        },
      }}
    />
  ))
  .add("verified but blocked to start", () => (
    <LinkedBankAccountLayout
      isBankAccountVerified={true}
      neurStatus={ENEURWalletStatus.DISABLED_NON_VERIFIED}
      verifyBankAccount={action("verify")}
      bankAccount={{
        hasBankAccount: true,
        details: {
          bankAccountNumberLast4: "1234",
          bankName: "mBank",
          name: "Lorem Ipsum",
          isSepa: true,
          swiftCode: "33212",
        },
      }}
    />
  ));
