import {
  EthereumAddressWithChecksum,
  EthereumTxHash,
  toEquityTokenSymbol,
} from "@neufund/shared-utils";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import {
  ETransactionDirection,
  ETransactionStatus,
  ETransactionSubType,
  ETransactionType,
} from "../../../modules/tx-history/types";
import { withModalBody } from "../../../utils/react-connected-components/storybookHelpers.unsafe";
import { ECurrency, ENumberInputFormat } from "../../shared/formatters/utils";
import { TransactionDetailsModal } from "./TransactionDetailsModal";

import tokenIcon from "../../../assets/img/token_icon.svg";

const transactionCommon = {
  blockNumber: 634,
  date: "2019-07-30T02:16:08Z",
  id: "634_0_256",
  logIndex: 256,
  transactionIndex: 0,
  txHash: "0x8f4b26cc87772840cd496402d55c33ab83b48cbd7c3650821152c07efa27226d" as EthereumTxHash,
};

storiesOf("Templates|TransacionDetailsModal", module)
  .addDecorator(withModalBody())
  .add("transfer out transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "2281200000000000000",
        amountEur: "570300000000000000000",
        amountFormat: ENumberInputFormat.ULPS,
        currency: ECurrency.ETH,
        fromAddress: "0xfA1Af2E251ee739F83e14d7daCfd77B3d0E930b7" as EthereumAddressWithChecksum,
        subType: undefined,
        toAddress: "0x6C6f9115BE53c4424016f28d916196B29fF222dF" as EthereumAddressWithChecksum,
        transactionDirection: ETransactionDirection.OUT,
        type: ETransactionType.TRANSFER,
        ...transactionCommon,
      }}
    />
  ))
  .add("transfer in transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "2281200000000000000",
        amountEur: "570300000000000000000",
        amountFormat: ENumberInputFormat.ULPS,
        currency: ECurrency.ETH,
        fromAddress: "0xfA1Af2E251ee739F83e14d7daCfd77B3d0E930b7" as EthereumAddressWithChecksum,
        subType: undefined,
        toAddress: "0x6C6f9115BE53c4424016f28d916196B29fF222dF" as EthereumAddressWithChecksum,
        transactionDirection: ETransactionDirection.IN,
        type: ETransactionType.TRANSFER,
        ...transactionCommon,
      }}
    />
  ))
  .add("transfer out equity token transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "1000",
        amountFormat: ENumberInputFormat.FLOAT,
        currency: toEquityTokenSymbol("QTT"),
        etoId: "0xed1Dc67d0505019122bcf4E318bB750cb6FeF3de" as EthereumAddressWithChecksum,
        fromAddress: "0xfA1Af2E251ee739F83e14d7daCfd77B3d0E930b7" as EthereumAddressWithChecksum,
        icon: tokenIcon,
        subType: ETransactionSubType.TRANSFER_EQUITY_TOKEN,
        toAddress: "0x6C6f9115BE53c4424016f28d916196B29fF222dF" as EthereumAddressWithChecksum,
        transactionDirection: ETransactionDirection.OUT,
        type: ETransactionType.TRANSFER,
        ...transactionCommon,
      }}
    />
  ))
  .add("Neur purchase transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "1.0265e+22",
        amountFormat: ENumberInputFormat.ULPS,
        currency: ECurrency.EUR_TOKEN,
        subType: undefined,
        toAddress: "0x6C6f9115BE53c4424016f28d916196B29fF222dF" as EthereumAddressWithChecksum,
        transactionDirection: ETransactionDirection.IN,
        type: ETransactionType.NEUR_PURCHASE,
        ...transactionCommon,
      }}
    />
  ))
  .add("eto tokens claim transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "10460320",
        amountFormat: ENumberInputFormat.FLOAT,
        currency: toEquityTokenSymbol("QTT"),
        etoId: "0xed1Dc67d0505019122bcf4E318bB750cb6FeF3de" as EthereumAddressWithChecksum,
        icon: tokenIcon,
        neuReward: "1.0282261234728144e+25",
        neuRewardEur: "1.0282261234728144e+24",
        subType: undefined,
        transactionDirection: ETransactionDirection.IN,
        type: ETransactionType.ETO_TOKENS_CLAIM,
        ...transactionCommon,
      }}
    />
  ))
  .add("neur destroy transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "2281200000000000000",
        amountFormat: ENumberInputFormat.ULPS,
        currency: ECurrency.EUR_TOKEN,
        liquidatedByAddress: "0xed1Dc67d0505019122bcf4E318bB750cb6FeF3de" as EthereumAddressWithChecksum,
        subType: undefined,
        transactionDirection: ETransactionDirection.OUT,
        type: ETransactionType.NEUR_DESTROY,
        ...transactionCommon,
      }}
    />
  ))
  .add("eto refund transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "2281200000000000000",
        amountEur: "570300000000000000000",
        amountFormat: ENumberInputFormat.ULPS,
        companyName: "Fifth Force",
        currency: ECurrency.ETH,
        etoId: "0xed1Dc67d0505019122bcf4E318bB750cb6FeF3de" as EthereumAddressWithChecksum,
        subType: undefined,
        toAddress: "0xed1Dc67d0505019122bcf4E318bB750cb6FeF3de" as EthereumAddressWithChecksum,
        transactionDirection: ETransactionDirection.IN,
        type: ETransactionType.ETO_REFUND,
        ...transactionCommon,
      }}
    />
  ))
  .add("redistribute payout transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "2281200000000000000",
        amountEur: "570300000000000000000",
        amountFormat: ENumberInputFormat.ULPS,
        currency: ECurrency.ETH,
        subType: undefined,
        transactionDirection: ETransactionDirection.OUT,
        type: ETransactionType.REDISTRIBUTE_PAYOUT,
        ...transactionCommon,
      }}
    />
  ))
  .add("payout transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "2281200000000000000",
        amountEur: "570300000000000000000",
        amountFormat: ENumberInputFormat.ULPS,
        currency: ECurrency.ETH,
        subType: undefined,
        transactionDirection: ETransactionDirection.OUT,
        type: ETransactionType.PAYOUT,
        toAddress: "0xed1Dc67d0505019122bcf4E318bB750cb6FeF3de" as EthereumAddressWithChecksum,
        ...transactionCommon,
      }}
    />
  ))
  .add("eto investment completed transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "2281200000000000000",
        amountEur: "570300000000000000000",
        amountFormat: ENumberInputFormat.ULPS,
        companyName: "Fifth Force",
        currency: ECurrency.ETH,
        equityTokenAmount: "10000000",
        equityTokenAmountFormat: ENumberInputFormat.FLOAT,
        equityTokenCurrency: toEquityTokenSymbol("QTT"),
        equityTokenIcon: tokenIcon,
        etoId: "0xed1Dc67d0505019122bcf4E318bB750cb6FeF3de" as EthereumAddressWithChecksum,
        fromAddress: "0xedBaa635e95ec605d577ACa41Ca0eeF62617802E" as EthereumAddressWithChecksum,
        isICBMInvestment: false,
        neuReward: "1.0282261234728144e+25",
        neuRewardEur: "1.0282261234728144e+24",
        subType: ETransactionStatus.COMPLETED,
        toAddress: "0xed1Dc67d0505019122bcf4E318bB750cb6FeF3de" as EthereumAddressWithChecksum,
        transactionDirection: ETransactionDirection.OUT,
        type: ETransactionType.ETO_INVESTMENT,
        ...transactionCommon,
      }}
    />
  ))
  .add("eto investment completed icbm transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "2281200000000000000",
        amountEur: "570300000000000000000",
        amountFormat: ENumberInputFormat.ULPS,
        companyName: "Fifth Force",
        currency: ECurrency.ETH,
        equityTokenAmount: "10000000",
        equityTokenAmountFormat: ENumberInputFormat.FLOAT,
        equityTokenCurrency: toEquityTokenSymbol("QTT"),
        equityTokenIcon: tokenIcon,
        etoId: "0xed1Dc67d0505019122bcf4E318bB750cb6FeF3de" as EthereumAddressWithChecksum,
        fromAddress: "0xedBaa635e95ec605d577ACa41Ca0eeF62617802E" as EthereumAddressWithChecksum,
        isICBMInvestment: true,
        neuReward: "1.0282261234728144e+25",
        neuRewardEur: "1.0282261234728144e+24",
        subType: ETransactionStatus.COMPLETED,
        toAddress: "0xed1Dc67d0505019122bcf4E318bB750cb6FeF3de" as EthereumAddressWithChecksum,
        transactionDirection: ETransactionDirection.OUT,
        type: ETransactionType.ETO_INVESTMENT,
        ...transactionCommon,
      }}
    />
  ))
  .add("eto investment pending transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "2281200000000000000",
        amountEur: "570300000000000000000",
        amountFormat: ENumberInputFormat.ULPS,
        companyName: "Fifth Force",
        currency: ECurrency.ETH,
        equityTokenAmount: "10000000",
        equityTokenAmountFormat: ENumberInputFormat.FLOAT,
        equityTokenCurrency: toEquityTokenSymbol("QTT"),
        equityTokenIcon: tokenIcon,
        etoId: "0xed1Dc67d0505019122bcf4E318bB750cb6FeF3de" as EthereumAddressWithChecksum,
        fromAddress: "0xedBaa635e95ec605d577ACa41Ca0eeF62617802E" as EthereumAddressWithChecksum,
        isICBMInvestment: true,
        neuReward: "1.0282261234728144e+25",
        neuRewardEur: "1.0282261234728144e+24",
        subType: ETransactionStatus.PENDING,
        toAddress: "0xed1Dc67d0505019122bcf4E318bB750cb6FeF3de" as EthereumAddressWithChecksum,
        transactionDirection: ETransactionDirection.OUT,
        type: ETransactionType.ETO_INVESTMENT,
        ...transactionCommon,
      }}
    />
  ))
  .add("neur redeem pending transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "2281200000000000000",
        amountFormat: ENumberInputFormat.ULPS,
        currency: ECurrency.EUR_TOKEN,
        fromAddress: "0xedBaa635e95ec605d577ACa41Ca0eeF62617802E" as EthereumAddressWithChecksum,
        subType: ETransactionStatus.PENDING,
        transactionDirection: ETransactionDirection.OUT,
        type: ETransactionType.NEUR_REDEEM,
        reference: "RWAF14AVA5",
        ...transactionCommon,
      }}
    />
  ))
  .add("neur redeem completed transaction", () => (
    <TransactionDetailsModal
      closeModal={action("closeModal")}
      transaction={{
        amount: "2281200000000000000",
        amountFormat: ENumberInputFormat.ULPS,
        currency: ECurrency.EUR_TOKEN,
        fromAddress: "0xedBaa635e95ec605d577ACa41Ca0eeF62617802E" as EthereumAddressWithChecksum,
        subType: ETransactionStatus.COMPLETED,
        transactionDirection: ETransactionDirection.OUT,
        type: ETransactionType.NEUR_REDEEM,
        reference: "RWAF14AVA5",
        settledAmount: "2171200000000000000",
        feeAmount: "110000000000000000",
        ...transactionCommon,
      }}
    />
  ));
