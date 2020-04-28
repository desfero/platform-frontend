import { EquityToken, EthereumAddressWithChecksum, EthereumTxHash } from "@neufund/shared-utils";

import { ECurrency, ENumberInputFormat } from "../../components/shared/formatters/utils";
import { ETransactionDirection, ETransactionType } from "./lib/http/analytics-api/interfaces";

export { ETransactionDirection, ETransactionType } from "./lib/http/analytics-api/interfaces";

export enum ETransactionSubType {
  TRANSFER_EQUITY_TOKEN = "tokenTransfer",
}

export enum ETransactionStatus {
  COMPLETED = "completed",
  PENDING = "pending",
}

export type TTxHistoryCommon = {
  amount: string;
  amountFormat: ENumberInputFormat;
  blockNumber: number;
  date: string;
  id: string;
  logIndex: number;
  transactionDirection: ETransactionDirection;
  transactionIndex: number;
  txHash: EthereumTxHash;
};

export type TEtoInvestmentTx = {
  type: ETransactionType.ETO_INVESTMENT;
  subType: ETransactionStatus;
  isICBMInvestment: boolean;
  amountEur: string;
  companyName: string;
  currency: ECurrency;
  equityTokenAmount: string;
  equityTokenAmountFormat: ENumberInputFormat;
  equityTokenCurrency: EquityToken;
  equityTokenIcon: string;
  etoId: EthereumAddressWithChecksum;
  toAddress: EthereumAddressWithChecksum;
  fromAddress: EthereumAddressWithChecksum;
  neuReward: string;
  neuRewardEur: string;
};

export type TEtoRefundTx = {
  type: ETransactionType.ETO_REFUND;
  subType: undefined;
  companyName: string;
  etoId: EthereumAddressWithChecksum;
  currency: ECurrency;
  amountEur: string;
  toAddress: EthereumAddressWithChecksum;
};

export type TTransferEquityToken = {
  type: ETransactionType.TRANSFER;
  subType: ETransactionSubType.TRANSFER_EQUITY_TOKEN;
  currency: EquityToken;
  etoId: EthereumAddressWithChecksum;
  fromAddress: EthereumAddressWithChecksum;
  toAddress: EthereumAddressWithChecksum;
  icon: string;
};

export type TTransferWellKnownToken = {
  type: ETransactionType.TRANSFER;
  subType: undefined;
  currency: ECurrency;
  amountEur: string;
  fromAddress: EthereumAddressWithChecksum;
  toAddress: EthereumAddressWithChecksum;
};

export type TNEURTransfer = {
  type: ETransactionType.NEUR_PURCHASE;
  subType: undefined;
  currency: ECurrency.EUR_TOKEN;
  toAddress: EthereumAddressWithChecksum;
};

export type TNEURRedeemPendingTransfer = {
  type: ETransactionType.NEUR_REDEEM;
  subType: ETransactionStatus.PENDING;
  currency: ECurrency.EUR_TOKEN;
  reference: string;
  fromAddress: EthereumAddressWithChecksum;
};

export type TNEURRedeemCompletedTransfer = {
  type: ETransactionType.NEUR_REDEEM;
  subType: ETransactionStatus.COMPLETED;
  currency: ECurrency.EUR_TOKEN;
  reference: string;
  fromAddress: EthereumAddressWithChecksum;
  settledAmount: string;
  feeAmount: string;
};

export type TNEURDestroyTransfer = {
  type: ETransactionType.NEUR_DESTROY;
  subType: undefined;
  liquidatedByAddress: EthereumAddressWithChecksum;
  currency: ECurrency.EUR_TOKEN;
};

export type EtoTokensClaimTransfer = {
  type: ETransactionType.ETO_TOKENS_CLAIM;
  subType: undefined;
  currency: EquityToken;
  etoId: EthereumAddressWithChecksum;
  neuReward: string;
  icon: string;
  neuRewardEur: string;
};

export type TPayoutTransfer = {
  type: ETransactionType.PAYOUT;
  subType: undefined;
  amountEur: string;
  currency: ECurrency;
  toAddress: EthereumAddressWithChecksum;
};

export type TRedistributePayoutTransfer = {
  type: ETransactionType.REDISTRIBUTE_PAYOUT;
  subType: undefined;
  amountEur: string;
  currency: ECurrency;
};

export type TTxHistory = (
  | TEtoRefundTx
  | TEtoInvestmentTx
  | TPayoutTransfer
  | TRedistributePayoutTransfer
  | TTransferEquityToken
  | TTransferWellKnownToken
  | TNEURTransfer
  | TNEURRedeemPendingTransfer
  | TNEURRedeemCompletedTransfer
  | TNEURDestroyTransfer
  | EtoTokensClaimTransfer
) &
  TTxHistoryCommon;

export type TExtractTxHistoryFromType<T extends ETransactionType> = Extract<
  TTxHistory,
  { type: T }
>;
