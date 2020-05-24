import * as Yup from "yup";

import { ETxType } from "../../../lib/web3/types";
import { ETransactionErrorType, ETxSenderState } from "../../../modules/tx/sender/reducer";
import * as YupTS from "../../yup-ts.unsafe";

export const OOO_TRANSACTION_TYPE = "mempool";

export const GasStipendSchema = Yup.object()
  .shape({ gasStipend: Yup.number().required() })
  .required();

export const TxPendingDataSchema = YupTS.object({
  failedRpcError: YupTS.string().optional(),
  blockHash: YupTS.string().optional(),
  blockNumber: YupTS.string().optional(),
  chainId: YupTS.string().optional(),
  from: YupTS.string(),
  gas: YupTS.string(),
  gasPrice: YupTS.string(),
  hash: YupTS.string(),
  input: YupTS.string(),
  nonce: YupTS.string(),
  status: YupTS.string().optional(),
  to: YupTS.string(),
  transactionIndex: YupTS.string().optional(),
  value: YupTS.string(),
});

const TxPendingExternalSchema = YupTS.object({
  transaction: TxPendingDataSchema,
  transactionType: YupTS.string<typeof OOO_TRANSACTION_TYPE>(),
});

const TxPendingWithMetadataSchema = YupTS.object({
  transaction: TxPendingDataSchema,
  transactionType: YupTS.string<ETxType>(),
  transactionTimestamp: YupTS.number(),
  transactionStatus: YupTS.string<ETxSenderState>(),
  transactionError: YupTS.string<ETransactionErrorType>().optional(),
});

const PendingTxsSchema = YupTS.object({
  // it's a pending transaction issued by us
  pendingTransaction: TxPendingWithMetadataSchema.optional(),
  // list of other pending transaction (out of bounds transactions) issued externally
  oooTransactions: YupTS.array(TxPendingExternalSchema),
});

export type TxPendingData = YupTS.TypeOf<typeof TxPendingDataSchema>;
export type TxPendingExternal = YupTS.TypeOf<typeof TxPendingExternalSchema>;
export type TxPendingWithMetadata = YupTS.TypeOf<typeof TxPendingWithMetadataSchema> & {
  transactionAdditionalData?: any;
};
export type TPendingTxs = YupTS.TypeOf<typeof PendingTxsSchema>;
