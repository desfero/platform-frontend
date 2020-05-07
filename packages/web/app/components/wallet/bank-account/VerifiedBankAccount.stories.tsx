import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { VerifiedBankAccountComponent } from "./VerifiedBankAccount";

storiesOf("VerifiedBankAccount", module)
  .add("not verified", () => (
    <VerifiedBankAccountComponent
      onVerify={action("onVerify")}
      isVerified={false}
      isUserFullyVerified={true}
    />
  ))
  .add("not verified and blocked to start", () => (
    <VerifiedBankAccountComponent
      onVerify={action("onVerify")}
      isVerified={false}
      isUserFullyVerified={false}
    />
  ))
  .add("verified", () => (
    <VerifiedBankAccountComponent
      onVerify={action("onVerify")}
      isUserFullyVerified={true}
      isVerified={true}
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
  .add("verified but blocked to start again", () => (
    <VerifiedBankAccountComponent
      onVerify={action("onVerify")}
      isUserFullyVerified={false}
      isVerified={true}
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
  .add("with border", () => (
    <VerifiedBankAccountComponent
      onVerify={action("onVerify")}
      isUserFullyVerified={false}
      isVerified={true}
      withBorder={true}
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
