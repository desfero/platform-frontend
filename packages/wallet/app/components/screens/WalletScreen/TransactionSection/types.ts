// TODO: Sync it with tx-history module when ready
import { EquityToken, EthereumTxHash } from "@neufund/shared-utils";

export enum ETransactionDirection {
  IN = "in",
  OUT = "out",
}

export type TTransaction = {
  name: string;
  txHash: EthereumTxHash;
  timestamp: number;
  value: string;
  valueToken: EquityToken;
  valueDecimals: number;
  valueEquivalent?: string;
  valueEquivalentToken?: EquityToken;
  valueEquivalentDecimals?: number;
  direction: ETransactionDirection;
};
