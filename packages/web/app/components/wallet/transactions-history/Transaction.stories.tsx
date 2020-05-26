import { storiesOf } from "@storybook/react";
import * as React from "react";

import { Transaction } from "./Transaction";
import { action } from "@storybook/addon-actions";
import {
  etoTokensClaimTransferTxData,
  investmentTxData,
  neurDestroyTransferTxData,
  neuroTransferTxData,
  neurRedeemCompletedTransferTxData,
  neurRedeemPendingTransferTxData,
  payoutTransferTxData,
  redistributeTxData,
  refundTxData,
  transferEquityTokenTxData,
  transferWellKnownTokenTxData
} from "../../../../test/fixtures/transactions";

storiesOf("Molecules|Transaction", module)
  .add("refundTxData", () => {
    return <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={refundTxData}
    />;
  })
  .add("investmentTxData", () => {
    return <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={investmentTxData}
    />;
  })
  .add("payoutTransferTxData", () => {
    return <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={payoutTransferTxData}
    />;
  })
  .add("redistributeTxData", () => {
    return <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={redistributeTxData}
    />;
  })
  .add("transferEquityTokenTxData", () => {
        return <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={transferEquityTokenTxData}
    />;
  })
  .add("transferWellKnownTokenTxData", () => {
    return <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={transferWellKnownTokenTxData}
    />;
  })
  .add("neuroTransferTxData", () => {
    return <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={neuroTransferTxData}
    />;
  })
  .add("neurRedeemPendingTransferTxData", () => {
    return <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={neurRedeemPendingTransferTxData}
    />;
  })
  .add("neurRedeemCompletedTransferTxData", () => {
    return <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={neurRedeemCompletedTransferTxData}
    />;
  })
  .add("neurDestroyTransferTxData", () => {
    return <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={neurDestroyTransferTxData}
    />;
  })
  .add("etoTokensClaimTransferTxData", () => {
    return <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={etoTokensClaimTransferTxData}
    />;
  })
