import { TypeOfYTS, YupTS } from "@neufund/shared-modules";
import { EquityToken, EthereumAddressWithChecksum, EthereumTxHash } from "@neufund/shared-utils";

export enum ETransactionDirection {
  IN = "in",
  OUT = "out",
}

export enum ETransactionType {
  ETO_INVESTMENT = "eto_investment",
  ETO_REFUND = "eto_refund",
  ETO_TOKENS_CLAIM = "eto_tokens_claim",
  NEUR_PURCHASE = "neur_purchase",
  NEUR_REDEEM = "neur_redeem",
  TRANSFER = "transfer",
  PAYOUT = "payout",
  REDISTRIBUTE_PAYOUT = "redistribute_payout",
  NEUR_DESTROY = "neur_destroy",

  // new one, not yet implemented on the frontend
  ETO_RELEASE_FUNDS = "eto_release_funds",
  ETO_RELEASE_CAPITAL_INCREASE = "eto_release_capital_increase",
  ETO_COMPANY_SIGNED_AGREEMENT = "eto_company_signed_agreement",
  ETO_TERMS_SET = "eto_terms_set",
  ETO_START_DATE_SET = "eto_start_date_set",
  NOMINEE_CONFIRMED_AGREEMENT = "nominee_confirmed_agreement",
  GAS_EXCHANGE = "gas_exchange",
  ICBM_FUNDS_MIGRATED = "icbm_funds_migrated",
  ICBM_FUNDS_UNLOCKED = "icbm_funds_unlocked",
  ICBM_UNLOCK_PENALTY = "icbm_unlock_penalty",
}

export const AnalyticsTransactionTokenMetadataSchema = YupTS.object({
  companyName: YupTS.string().optional(),
  tokenImage: YupTS.string().optional(),
  tokenCommitmentAddress: YupTS.string<EthereumAddressWithChecksum>().optional(),
  tokenSymbol: YupTS.string<EquityToken>(),
  tokenDecimals: YupTS.number(),
});
export type TAnalyticsTransactionTokenMetadata = TypeOfYTS<
  typeof AnalyticsTransactionTokenMetadataSchema
>;

export const AnalyticsTransactionExtraDataSchema = YupTS.object({
  amount: YupTS.number(),
  assetTokenMetadata: AnalyticsTransactionTokenMetadataSchema.optional(),
  baseCurrencyEquivalent: YupTS.number().optional(),
  byAddress: YupTS.string<EthereumAddressWithChecksum>().optional(),
  fromAddress: YupTS.string<EthereumAddressWithChecksum>().optional(),
  grantedAmount: YupTS.number().optional(),
  isClaimed: YupTS.boolean().optional(),
  isRefunded: YupTS.boolean().optional(),
  neumarkReward: YupTS.number().optional(),
  toAddress: YupTS.string<EthereumAddressWithChecksum>().optional(),
  tokenAddress: YupTS.string<EthereumAddressWithChecksum>().optional(),
  tokenInterface: YupTS.string().optional(),
  tokenMetadata: AnalyticsTransactionTokenMetadataSchema.optional(),
  walletAddress: YupTS.string<EthereumAddressWithChecksum>().optional(),
  settledAmount: YupTS.number().optional(),
  reference: YupTS.string().optional(),
});

export const AnalyticsTransactionSchema = YupTS.object({
  blockNumber: YupTS.number(),
  blockTime: YupTS.string(),
  extraData: AnalyticsTransactionExtraDataSchema,
  logIndex: YupTS.number(),
  transactionDirection: YupTS.string<ETransactionDirection>(),
  transactionIndex: YupTS.number(),
  txHash: YupTS.string<EthereumTxHash>(),
  type: YupTS.string<ETransactionType>(),
  version: YupTS.number(),
});
export type TAnalyticsTransaction = TypeOfYTS<typeof AnalyticsTransactionSchema>;

export const AnalyticsTransactionsResponseSchema = YupTS.object({
  beforeTransaction: YupTS.string().optional(),
  address: YupTS.string(),
  version: YupTS.number().optional(),
  transactions: YupTS.array(AnalyticsTransactionSchema),
});
export type TAnalyticsTransactionsResponse = TypeOfYTS<typeof AnalyticsTransactionsResponseSchema>;
