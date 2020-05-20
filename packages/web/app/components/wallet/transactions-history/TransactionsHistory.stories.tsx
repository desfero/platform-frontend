import { ETransactionDirection, ETransactionType, txHistoryApi } from "@neufund/shared-modules";
import { ECurrency, ENumberInputFormat } from "@neufund/shared-utils";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { TxPendingWithMetadata } from "../../../lib/api/users-tx/interfaces";
import { ETxSenderType } from "../../../modules/tx/types";
import { TransactionListLayout } from "./TransactionsHistory";

const pendingTransactionGeneral = {
  transaction: {
    from: "0xA622f39780fC8722243b49ACF3bFFEEb9B9201F2",
    gas: "0x15dc0",
    gasPrice: "0x3a1d51c00",
    hash: "0xd5cd84e84ced9eccc8f80cd4e5b1d40e8cb42a76d9b0dfb9d575bb389c42fad8",
    input:
      "0x64663ea60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016345785d8a0000",
    nonce: "0x0",
    to: "0x8843fd9a6e5078ab538dd49f6e106e822508225a",
    value: "0x0",
  },
  transactionType: "WITHDRAW",
  transactionAdditionalData: {
    to: "0x0000000000000000000000000000000000000000",
    amount: "100000000000000000",
    total: "101396761600000000",
    totalEur: "19470473800366460490.458112",
    tokenSymbol: "eth",
    tokenImage: "/images/1b0f8ccf.svg",
    tokenDecimals: 18,
    currency: "eth",
    subType: "pending",
    transactionDirection: "out",
    amountFormat: "ulps",
    type: "transfer",
  },
  transactionStatus: "MINING",
  transactionTimestamp: 1589738946289,
} as TxPendingWithMetadata;

const pendingTransactionThaSigning = {
  transactionType: ETxSenderType.NOMINEE_THA_SIGN,
  transaction: {},
} as TxPendingWithMetadata;

const transactions = {
  transactions: [
    {
      amount: "10000000000000000",
      amountFormat: ENumberInputFormat.ULPS,
      blockNumber: 986,
      date: "2020-05-18T02:19:36Z",
      id: "986_0_256",
      logIndex: 256,
      transactionDirection: ETransactionDirection.IN,
      transactionIndex: 0,
      txHash: "0x19485acd853bf0147f96380154a51f52ecedcdc2bf7e6242051314c53aa76cae",
      currency: ECurrency.ETH,
      amountEur: "1949018870873095200",
      type: ETransactionType.TRANSFER,
      toAddress: "0x844C5c9cE2Ad620592A5D686Fc8e76866f039c56",
      fromAddress: "0x29c57b5F27b249Ab3c11Badf6efc4B2308bc75Dd",
    },
    {
      amount: "100000000000000000000",
      amountFormat: ENumberInputFormat.ULPS,
      blockNumber: 126,
      date: "2020-05-18T02:13:57Z",
      id: "126_0_256",
      logIndex: 256,
      transactionDirection: ETransactionDirection.OUT,
      transactionIndex: 0,
      txHash: "0xd92d53effd71fd8f80821e2eb1a82864553dedf0bed322869dfecf586ab60f49",
      currency: ECurrency.ETH,
      amountEur: "1.9490188708730952e+22",
      type: ETransactionType.TRANSFER,
      toAddress: "0x238f2bEFB74CF762346341a525a4C548f5e2e386",
      fromAddress: "0x844C5c9cE2Ad620592A5D686Fc8e76866f039c56",
    },
    {
      amount: "9.383086134931367e+22",
      amountFormat: ENumberInputFormat.ULPS,
      blockNumber: 126,
      date: "2020-05-18T02:13:57Z",
      id: "126_0_9",
      logIndex: 9,
      transactionDirection: ETransactionDirection.IN,
      transactionIndex: 0,
      txHash: "0xd92d53effd71fd8f80821e2eb1a82864553dedf0bed322869dfecf586ab60f49",
      currency: ECurrency.NEU,
      amountEur: "1.23533728569715306549307156226995e+22",
      type: ETransactionType.TRANSFER,
      toAddress: "0x844C5c9cE2Ad620592A5D686Fc8e76866f039c56",
      fromAddress: "0x238f2bEFB74CF762346341a525a4C548f5e2e386",
    },
  ],
  canLoadMore: false,
  isLoading: false,
};

storiesOf("TransactionList", module)
  .add("with a pending transaction of WITHDRAW type", () => (
    <TransactionListLayout
      transactionsHistoryPaginated={
        transactions as ReturnType<typeof txHistoryApi.selectors.selectTxHistoryPaginated>
      }
      loadTxHistoryNext={action("load next")}
      pendingTransaction={pendingTransactionGeneral}
      showTransactionDetails={action("show transaction details")}
    />
  ))
  .add("with a pending transaction of NOMINEE_THA_SIGN type", () => (
    <TransactionListLayout
      transactionsHistoryPaginated={
        transactions as ReturnType<typeof txHistoryApi.selectors.selectTxHistoryPaginated>
      }
      loadTxHistoryNext={action("load next")}
      pendingTransaction={pendingTransactionThaSigning}
      showTransactionDetails={action("show transaction details")}
    />
  ));
