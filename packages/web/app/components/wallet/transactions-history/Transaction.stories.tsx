import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

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
  transferWellKnownTokenTxData,
} from "../../../../test/fixtures/transactions";
import { Transaction } from "./Transaction";

storiesOf("Molecules|Transaction", module)
  .add("refundTxData", () => (
    <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={refundTxData}
    />
  ))
  .add("investmentTxData", () => (
    <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={investmentTxData}
    />
  ))
  .add("payoutTransferTxData", () => (
    <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={payoutTransferTxData}
    />
  ))
  .add("redistributeTxData", () => (
    <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={redistributeTxData}
    />
  ))
  .add("transferEquityTokenTxData", () => (
    <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={transferEquityTokenTxData}
    />
  ))
  .add("transferWellKnownTokenTxData", () => (
    <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={transferWellKnownTokenTxData}
    />
  ))
  .add("neuroTransferTxData", () => (
    <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={neuroTransferTxData}
    />
  ))
  .add("neurRedeemPendingTransferTxData", () => (
    <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={neurRedeemPendingTransferTxData}
    />
  ))
  .add("neurRedeemCompletedTransferTxData", () => (
    <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={neurRedeemCompletedTransferTxData}
    />
  ))
  .add("neurDestroyTransferTxData", () => (
    <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={neurDestroyTransferTxData}
    />
  ))
  .add("etoTokensClaimTransferTxData", () => (
    <Transaction
      showTransactionDetails={action("showTransactionDetails")}
      transaction={etoTokensClaimTransferTxData}
    />
  ));
