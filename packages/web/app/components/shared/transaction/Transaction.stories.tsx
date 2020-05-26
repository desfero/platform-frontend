import { ETransactionDirection, ETransactionType } from "@neufund/shared-modules";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { TxPendingWithMetadata } from "../../../lib/api/users-tx/interfaces";
import { generalPendingTxFixture } from "../../../modules/tx/utils";
import { PendingTransactionImage } from "../../layouts/header/PendingTransactionStatus";
import { ECurrency } from "../formatters/utils";
import { Transaction } from "./Transaction";

const fromAddress = "0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8989";
storiesOf("Molecules|Transaction", module)
  .add("Withdraw", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);

    return <Transaction transaction={transaction} />;
  })
  .add("Send", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);
    transaction.transactionAdditionalData.transactionDirection = ETransactionDirection.OUT;

    return <Transaction transaction={transaction} />;
  })
  .add("Invest ETH", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);
    transaction.transactionAdditionalData.type = ETransactionType.ETO_INVESTMENT;
    transaction.transactionAdditionalData.currency = ECurrency.ETH;

    return <Transaction transaction={transaction} />;
  })
  .add("Invest nEuro", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);
    transaction.transactionAdditionalData.type = ETransactionType.ETO_INVESTMENT;
    transaction.transactionAdditionalData.currency = ECurrency.EUR_TOKEN;

    return <Transaction transaction={transaction} />;
  })
  .add("Invest ICBM balance", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);
    transaction.transactionAdditionalData.type = ETransactionType.ETO_INVESTMENT;
    transaction.transactionAdditionalData.currency = ECurrency.EUR_TOKEN;
    transaction.transactionAdditionalData.isICBMInvestment = true;

    return <Transaction transaction={transaction} />;
  })
  .add("Claim tokens", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);
    transaction.transactionAdditionalData.type = ETransactionType.ETO_TOKENS_CLAIM;
    transaction.transactionAdditionalData.currency = "BKK";
    return <Transaction transaction={transaction} />;
  })
  .add("Claim tokens with icon", () => {
    const transaction: TxPendingWithMetadata = generalPendingTxFixture(fromAddress);
    transaction.transactionAdditionalData.type = ETransactionType.ETO_TOKENS_CLAIM;
    transaction.transactionAdditionalData.currency = "BKK";

    return <Transaction transaction={transaction} icon={<PendingTransactionImage />} />;
  });
