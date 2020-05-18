import * as Yup from "yup";

import { ETransactionErrorType, ETxSenderState } from "../../../modules/tx/sender/reducer";
import { ETxSenderType } from "../../../modules/tx/types";
import * as YupTS from "../../yup-ts.unsafe";

export const OOO_TRANSACTION_TYPE = "mempool";

export const GasStipendSchema = Yup.object()
  .shape({ gasStipend: Yup.number().required() })
  .required();

export const TxSchema = YupTS.object({
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

export const TxWithMetadataSchema = YupTS.object({
  transaction: TxSchema,
  transactionType: YupTS.string<typeof OOO_TRANSACTION_TYPE>(),
});

export const TxPendingWithMetadataSchema = YupTS.object({
  transaction: TxSchema,
  transactionType: YupTS.string<ETxSenderType>(),
  transactionTimestamp: YupTS.number(),
  transactionStatus: YupTS.string<ETxSenderState>(),
  transactionError: YupTS.string<ETransactionErrorType>().optional(),
});

export const PendingTxsSchema = YupTS.object({
  // it's a pending transaction issued by us
  pendingTransaction: TxPendingWithMetadataSchema.optional(),
  // list of other pending transaction (out of bounds transactions) issued externally
  oooTransactions: YupTS.array(TxWithMetadataSchema),
});

export type Tx = YupTS.TypeOf<typeof TxSchema>;
export type TxWithMetadata = YupTS.TypeOf<typeof TxWithMetadataSchema>;
export type TxPendingWithMetadata = YupTS.TypeOf<typeof TxPendingWithMetadataSchema> & {
  transactionAdditionalData?: any;
};
export type TPendingTxs = YupTS.TypeOf<typeof PendingTxsSchema>;
