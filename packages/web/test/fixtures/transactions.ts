import {
  ECurrency,
  ENumberInputFormat,
  EquityToken,
  EthereumAddressWithChecksum,
  EthereumTxHash
} from "@neufund/shared-utils";
import {
  ETransactionDirection,
  ETransactionStatus,
  ETransactionSubType,
  ETransactionType
} from "@neufund/shared-modules";

export const commonTxData = {
  amount: "132465754321456756325",
  amountFormat: ENumberInputFormat.ULPS,
  blockNumber: 123456,
  date: "2019-08-07T06:58:48.736923+00:00",
  id: "1234564987321sadfnkwea12398423",
  logIndex: 4,
  transactionDirection: ETransactionDirection.IN,
  transactionIndex: 34567,
  txHash: "0xea3145cf6334a8fe5a9570c05fef7ebb2b3c728369fccae5cf8f30809d99be94" as EthereumTxHash,
}

export const refundTxData = {
  type: ETransactionType.ETO_REFUND,
  subType: undefined,
  companyName: "FifthForce",
  etoId: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" as EthereumAddressWithChecksum,
  currency: ECurrency.ETH,
  amountEur: "132465754321456756325",
  toAddress: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" as EthereumAddressWithChecksum,
  ...commonTxData
} as const

export const investmentTxData = {
  type: ETransactionType.ETO_INVESTMENT,
  subType: ETransactionStatus.COMPLETED,
  isICBMInvestment: false,
  amountEur: "0264943153487654532343658",
  companyName: "FifthForce",
  currency: ECurrency.ETH,
  equityTokenAmount: "3247684567593044t",
  equityTokenAmountFormat: ENumberInputFormat.ULPS,
  equityTokenCurrency:  "BLA" as EquityToken,
  equityTokenIcon: 'icon',
  etoId: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" as EthereumAddressWithChecksum,
  toAddress: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" as EthereumAddressWithChecksum,
  fromAddress: "0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8989" as EthereumAddressWithChecksum,
  neuReward: "2378945068372",
  neuRewardEur: "0",
  ...commonTxData
} as const

export const payoutTransferTxData = {
  type: ETransactionType.PAYOUT,
  subType: undefined,
  amountEur: "0264943153487654532343658",
  currency: ECurrency.ETH,
  toAddress: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" as EthereumAddressWithChecksum,
  ...commonTxData
} as const

export const redistributeTxData = {
  type: ETransactionType.REDISTRIBUTE_PAYOUT,
  subType: undefined,
  amountEur: "0264943153487654532343658",
  currency: ECurrency.ETH,
  ...commonTxData
} as const

export const transferEquityTokenTxData = {
  type: ETransactionType.TRANSFER,
  subType: ETransactionSubType.TRANSFER_EQUITY_TOKEN,
  currency: "BLA" as EquityToken,
  etoId: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" as EthereumAddressWithChecksum,
  fromAddress: "0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8989" as EthereumAddressWithChecksum,
  toAddress: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" as EthereumAddressWithChecksum,
  icon: "icon",
  ...commonTxData
} as const

export const transferWellKnownTokenTxData = {
  type: ETransactionType.TRANSFER,
  subType: undefined,
  currency: ECurrency.ETH,
  amountEur: "0264943153487654532343658",
  fromAddress: "0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8989" as EthereumAddressWithChecksum,
  toAddress: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" as EthereumAddressWithChecksum,
  ...commonTxData
} as const

export const neuroTransferTxData = {
  type: ETransactionType.NEUR_PURCHASE,
  subType: undefined,
  currency: ECurrency.EUR_TOKEN,
  toAddress: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" as EthereumAddressWithChecksum,
  ...commonTxData
} as const

export const neurRedeemPendingTransferTxData = {
  type: ETransactionType.NEUR_REDEEM,
  subType: ETransactionStatus.PENDING,
  currency: ECurrency.EUR_TOKEN,
  reference: "34568rew876543rhg",
  fromAddress: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" as EthereumAddressWithChecksum,
  ...commonTxData
} as const

export const neurRedeemCompletedTransferTxData = {
  type: ETransactionType.NEUR_REDEEM,
  subType: ETransactionStatus.COMPLETED,
  currency: ECurrency.EUR_TOKEN,
  reference: "657890uhgjdkd",
  fromAddress: "0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8989" as EthereumAddressWithChecksum,
  settledAmount: "8678760987654876",
  feeAmount: "123",
  ...commonTxData
} as const

export const neurDestroyTransferTxData = {
  type: ETransactionType.NEUR_DESTROY,
  subType: undefined,
  liquidatedByAddress: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" as EthereumAddressWithChecksum,
  currency: ECurrency.EUR_TOKEN,
  ...commonTxData
} as const

export const etoTokensClaimTransferTxData = {
  type: ETransactionType.ETO_TOKENS_CLAIM,
  subType: undefined,
  currency: "BLA" as EquityToken,
  etoId: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" as EthereumAddressWithChecksum,
  neuReward: "0264943153487654532343658",
  icon: "icon",
  neuRewardEur: "0264943153487654532343658",
  ...commonTxData
} as const
