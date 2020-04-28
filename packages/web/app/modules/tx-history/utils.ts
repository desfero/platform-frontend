import { ECurrency, ENumberInputFormat } from "../../components/shared/formatters/utils";
import {
  TAnalyticsTransaction,
  TAnalyticsTransactionTokenMetadata,
} from "./lib/http/analytics-api/interfaces";

// TODO: Try to sync backend currency format with frontend, as currently we use `eur_t` for nEur
const getCurrencyFromTokenSymbol = (
  metadata: TAnalyticsTransactionTokenMetadata | undefined,
): ECurrency => {
  if (!metadata) {
    return ECurrency.ETH;
  }

  switch (metadata.tokenSymbol) {
    case "nEUR":
      return ECurrency.EUR_TOKEN;
    case "NEU":
      return ECurrency.NEU;
    case "ETH":
      return ECurrency.ETH;
    default:
      throw new Error(`Token ${metadata.tokenSymbol} is not supported`);
  }
};

const getDecimalsFormat = (
  metadata: TAnalyticsTransactionTokenMetadata | undefined,
): ENumberInputFormat => {
  if (!metadata) {
    return ENumberInputFormat.ULPS;
  }

  switch (metadata.tokenDecimals) {
    case 0:
      return ENumberInputFormat.FLOAT;
    case 18:
      return ENumberInputFormat.ULPS;
    default:
      throw new Error(`Unsupported token decimals ${metadata.tokenDecimals} received`);
  }
};

const getTxUniqueId = (transaction: TAnalyticsTransaction) =>
  `${transaction.blockNumber}_${transaction.transactionIndex}_${transaction.logIndex}`;

export { getCurrencyFromTokenSymbol, getDecimalsFormat, getTxUniqueId };
