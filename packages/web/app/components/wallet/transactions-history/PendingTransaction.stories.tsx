import { ETransactionDirection, ETransactionType } from "@neufund/shared-modules";
import { ECurrency } from "@neufund/shared-utils";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { TxPendingWithMetadata } from "../../../lib/api/users-tx/interfaces";
import { generalPendingTxFixture } from "../../../modules/tx/utils";
import { PendingTransaction } from "./PendingTransaction";

const fromAddress = "0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8989";
storiesOf("Molecules|Transaction", module)
  .add("Withdraw", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);

    return <PendingTransaction transaction={transaction} />;
  })
  .add("Send", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);
    transaction.transactionAdditionalData.transactionDirection = ETransactionDirection.OUT;

    return <PendingTransaction transaction={transaction} />;
  })
  .add("Invest ETH", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);
    transaction.transactionAdditionalData.type = ETransactionType.ETO_INVESTMENT;
    transaction.transactionAdditionalData.currency = ECurrency.ETH;

    return <PendingTransaction transaction={transaction} />;
  })
  .add("Invest nEuro", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);
    transaction.transactionAdditionalData.type = ETransactionType.ETO_INVESTMENT;
    transaction.transactionAdditionalData.currency = ECurrency.EUR_TOKEN;

    return <PendingTransaction transaction={transaction} />;
  })
  .add("Invest ICBM balance", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);
    transaction.transactionAdditionalData.type = ETransactionType.ETO_INVESTMENT;
    transaction.transactionAdditionalData.currency = ECurrency.EUR_TOKEN;
    transaction.transactionAdditionalData.isICBMInvestment = true;

    return <PendingTransaction transaction={transaction} />;
  })
  .add("Claim tokens", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);
    transaction.transactionAdditionalData.type = ETransactionType.ETO_TOKENS_CLAIM;
    transaction.transactionAdditionalData.currency = "BKK";
    return <PendingTransaction transaction={transaction} />;
  })
  .add("Claim tokens with icon", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);
    transaction.transactionAdditionalData.type = ETransactionType.ETO_TOKENS_CLAIM;
    transaction.transactionAdditionalData.currency = "BKK";

    return <PendingTransaction transaction={transaction} />;
  });
