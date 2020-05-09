import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { ETxType } from "../../../../lib/web3/types";
import { ETokenType } from "../../../../modules/tx/types";
import { withModalBody } from "../../../../utils/react-connected-components/storybookHelpers.unsafe";
import { TxPendingLayout } from "./TxPending";

const txData: React.ComponentProps<typeof TxPendingLayout> = {
  blockId: 4623487932,
  txHash: "af908098b968d7564564362c51836",
  type: ETxType.UPGRADE,
  additionalData: {
    tokenType: ETokenType.ETHER,
  },
  txData: {
    to: "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359",
    value: "5500000000000000000",
    from: "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359",
    gas: "28288283",
    gasPrice: "224523523",
  },
  walletAddress: "0x123",
  deletePendingTransaction: () => action("RESET_TRANSACTION"),
  goToWallet: () => action("GO_TO_WALLET"),
};

storiesOf("TxPending", module)
  .addDecorator(withModalBody())
  .add("default", () => <TxPendingLayout {...txData} />);
