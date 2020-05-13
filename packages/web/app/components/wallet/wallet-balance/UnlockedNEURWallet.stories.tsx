import { ENEURWalletStatus } from "@neufund/shared-modules";
import { ECountries, EUSState, Q18 } from "@neufund/shared-utils";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { UnlockedNEURWallet } from "./UnlockedNEURWallet";

storiesOf("Unlocked EUR Wallet", module)
  .add("empty and disabled", () => (
    <UnlockedNEURWallet
      onPurchase={action("onPurchase")}
      onRedeem={action("redeem")}
      onVerify={action("onVerify")}
      neuroAmount={"0"}
      neuroEuroAmount={"0"}
      neurStatus={ENEURWalletStatus.DISABLED_NON_VERIFIED}
      individualAddress={undefined}
    />
  ))
  .add("empty and restricted US state", () => (
    <UnlockedNEURWallet
      onPurchase={action("onPurchase")}
      onRedeem={action("redeem")}
      onVerify={action("onVerify")}
      neuroAmount={"0"}
      neuroEuroAmount={"0"}
      neurStatus={ENEURWalletStatus.DISABLED_RESTRICTED_US_STATE}
      individualAddress={{
        usState: EUSState.ALABAMA,
        country: ECountries.UNITED_STATES,
        street: "Linkoln street",
        city: "Mobile",
        zipCode: "36525",
      }}
    />
  ))
  .add("not empty and enabled", () => (
    <UnlockedNEURWallet
      onPurchase={action("onPurchase")}
      onRedeem={action("redeem")}
      onVerify={action("onVerify")}
      neuroAmount={Q18.mul("847213").toString()}
      neuroEuroAmount={Q18.mul("847213").toString()}
      neurStatus={ENEURWalletStatus.ENABLED}
      individualAddress={undefined}
    />
  ));
