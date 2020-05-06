import { EquityToken, ETH_DECIMALS, multiplyBigNumbers } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";
import { addHexPrefix } from "ethereumjs-util";
import { TxData } from "web3";

import { ECurrency } from "../../components/shared/formatters/utils";
import { ETransactionDirection, ETransactionType } from "../../lib/api/analytics-api/interfaces";
import { TxPendingWithMetadata } from "../../lib/api/users/interfaces";
import { TBigNumberVariants } from "../../lib/web3/types";
import { EInvestmentType } from "../investment-flow/reducer";
import { ITokenDisbursal } from "../investor-portfolio/types";
import { ETxSenderState } from "./sender/reducer";
import { ETxType, TPendingTransactionType } from "./types";

export const GAS_PRICE_MULTIPLIER = 1 + parseFloat(process.env.NF_GAS_PRICE_OVERHEAD || "0");

export const GAS_LIMIT_MULTIPLIER = 1 + parseFloat(process.env.NF_GAS_LIMIT_OVERHEAD || "0");

export const EMPTY_DATA = "0x";

export const ETH_ADDRESS_SIZE = 42;

export const MINIMUM_ETH_RESERVE_GAS_UNITS = "1000000";

export const calculateGasPriceWithOverhead = (gasPrice: TBigNumberVariants) =>
  new BigNumber(multiplyBigNumbers([gasPrice, GAS_PRICE_MULTIPLIER.toString()])).ceil().toString();

export const calculateGasLimitWithOverhead = (gasLimit: TBigNumberVariants) =>
  new BigNumber(multiplyBigNumbers([gasLimit, GAS_LIMIT_MULTIPLIER.toString()])).ceil().toString();

export const encodeTransaction = (txData: Partial<TxData>) => ({
  from: addHexPrefix(txData.from!),
  to: addHexPrefix(txData.to!),
  gas: addHexPrefix(new BigNumber((txData.gas && txData.gas.toString()) || "0").toString(16)),
  gasPrice: addHexPrefix(
    new BigNumber((txData.gasPrice && txData.gasPrice.toString()) || "0").toString(16),
  ),
  value: addHexPrefix(new BigNumber((txData.value && txData.value.toString()) || "0").toString(16)),
  data: addHexPrefix(txData.data || EMPTY_DATA),
});

const getLatestTokensDisbursal = (transaction: TxPendingWithMetadata): ITokenDisbursal =>
  transaction.transactionAdditionalData.tokensDisbursals[
    transaction.transactionAdditionalData.tokensDisbursals.length - 1
  ];

export const getPendingTransactionAmount = (transaction: TxPendingWithMetadata): string => {
  if (!transaction.transactionAdditionalData) return "";
  let amount =
    transaction.transactionAdditionalData && transaction.transactionAdditionalData.amount;

  if (!amount) {
    switch (transaction.transactionAdditionalData.investmentType) {
      case EInvestmentType.NEur:
      case EInvestmentType.ICBMnEuro:
        amount = transaction.transactionAdditionalData.investmentEur;
        break;
      case EInvestmentType.Eth:
        amount = transaction.transactionAdditionalData.investmentEth;
    }

    switch (transaction.transactionType) {
      case ETxType.INVESTOR_REFUND:
        amount = transaction.transactionAdditionalData.amountEurUlps;
        break;
    }

    if (transaction.transactionAdditionalData.tokenQuantity) {
      amount = transaction.transactionAdditionalData.tokenQuantity;
    }

    if (transaction.transactionAdditionalData.tokensDisbursals) {
      const latestTokensDisbursal: ITokenDisbursal = getLatestTokensDisbursal(transaction);
      amount = latestTokensDisbursal.amountToBeClaimed;
    }
  }

  return amount;
};

export const generalPendingTxFixture = (
  from: string,
  transactionStatus: ETxSenderState = ETxSenderState.MINING,
  currency: ECurrency = ECurrency.EUR,
) => ({
  transaction: {
    from,
    gas: "0xe890",
    gasPrice: "0xd693a400",
    hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    input:
      "0x64663ea600000000000000000000000016cd5ac5a1b77fb72032e3a09e91a98bb21d89880000000000000000000000000000000000000000000000008ac7230489e80000",
    nonce: "0x0",
    to: "0xf538ca71b753e5fa634172c133e5f40ccaddaa80",
    value: "0x1",
    blockHash: undefined,
    blockNumber: undefined,
    chainId: undefined,
    status: undefined,
    transactionIndex: undefined,
    failedRpcError: undefined,
  },
  transactionAdditionalData: {
    to: "0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8988",
    total: "10000000000000000000",
    amount: "10000000000000000000",
    amountEur: "10000000000000000000",
    totalEur: "10000000000000000000",
    tokenSymbol: "QTT" as EquityToken,
    tokenImage: "test",
    tokenDecimals: ETH_DECIMALS,
    companyName: "Blokke",
    transactionDirection: ETransactionDirection.IN,
    investmentType: EInvestmentType.NEur,
    type: ETransactionType.TRANSFER,
    currency,
  },
  transactionStatus,
  transactionTimestamp: 1553762875525,
  transactionType: ETxType.WITHDRAW,
  transactionError: undefined,
});

export const getPendingTransactionCurrency = (transaction: TxPendingWithMetadata): ECurrency => {
  let currency;

  switch (transaction.transactionType) {
    case ETxType.NEUR_REDEEM:
      currency = ECurrency.EUR_TOKEN;
      break;
    case ETxType.USER_CLAIM:
      currency = transaction.transactionAdditionalData.tokenName;
      break;
    case ETxType.INVESTOR_REFUND:
      currency = ECurrency.EUR;
      break;
    case ETxType.INVESTOR_ACCEPT_PAYOUT:
      const latestTokensDisbursal: ITokenDisbursal = getLatestTokensDisbursal(transaction);
      currency = latestTokensDisbursal.token;
      break;
    default:
      currency =
        transaction.transactionAdditionalData && transaction.transactionAdditionalData.tokenSymbol;
      break;
  }
  if (!currency && transaction.transactionAdditionalData) {
    switch (transaction.transactionAdditionalData.investmentType) {
      case EInvestmentType.NEur:
        currency = ECurrency.EUR_TOKEN;
        break;
      case EInvestmentType.ICBMnEuro:
        currency = ECurrency.EUR_TOKEN;
        break;
      case EInvestmentType.Eth:
        currency = ECurrency.ETH;
        break;
    }
  }
  return currency;
};

export const getPendingTransactionType = (
  transaction: TxPendingWithMetadata,
): TPendingTransactionType => {
  switch (transaction.transactionType) {
    case ETxType.INVEST:
      return ETransactionType.ETO_INVESTMENT;
    case ETxType.NEUR_REDEEM:
      return ETransactionType.NEUR_REDEEM;
    case ETxType.USER_CLAIM:
      return ETransactionType.ETO_TOKENS_CLAIM;
    case ETxType.INVESTOR_ACCEPT_PAYOUT:
      return ETransactionType.PAYOUT;
    case ETxType.INVESTOR_REFUND:
      return ETransactionType.ETO_REFUND;
    case ETxType.INVESTOR_REDISTRIBUTE_PAYOUT:
      return ETransactionType.REDISTRIBUTE_PAYOUT;
    case ETxType.NOMINEE_THA_SIGN:
    case ETxType.SIGN_INVESTMENT_AGREEMENT:
      return ETransactionType.NOMINEE_CONFIRMED_AGREEMENT;
    default:
      return ETransactionType.TRANSFER;
  }
};

export const mismatchedPendingTxFixture = (from: string) => ({
  ...generalPendingTxFixture(from),
  transactionAdditionalData: {
    to: "0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8988",
    value: "10000000000000000000",
  },
});
