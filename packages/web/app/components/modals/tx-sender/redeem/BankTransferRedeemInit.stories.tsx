import { Q18 } from "@neufund/shared-utils";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { withModalBody } from "../../../../utils/react-connected-components/storybookHelpers.unsafe";
import { BankTransferRedeemLayout } from "./BankTransferRedeemInit";

storiesOf("BankTransferRedeem/Init", module)
  .addDecorator(withModalBody())
  .add("default", () => (
    <BankTransferRedeemLayout
      minAmount={Q18.mul("5").toString()}
      neuroAmount={Q18.mul("1305.89").toString()}
      neuroEuroAmount={Q18.mul("1305.89").toString()}
      bankFee={Q18.mul("0.005").toString()}
      confirm={action("CONFIRM")}
      initialAmount={undefined}
      verifyBankAccount={action("LINK_ACCOUNT")}
    />
  ));
