import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import * as Yup from "yup";

import { ETxType } from "../../../lib/web3/types";
import { ETransactionErrorType, ETxSenderState } from "../../../modules/tx/sender/reducer";
import { EWalletSubType, EWalletType } from "../../../modules/web3/types";
import * as YupTS from "../../yup-ts.unsafe";

export const OOO_TRANSACTION_TYPE = "mempool";

export enum EUserType {
  INVESTOR = "investor",
  ISSUER = "issuer",
  NOMINEE = "nominee",
}

export interface IUser {
  userId: EthereumAddressWithChecksum;
  backupCodesVerified?: boolean;
  latestAcceptedTosIpfs?: string;
  language?: string;
  unverifiedEmail?: string;
  verifiedEmail?: string;
  type: EUserType;
  walletType: EWalletType;
  walletSubtype: EWalletSubType;
}

export interface IEmailStatus {
  isAvailable: boolean;
}

export interface IUserInput {
  newEmail?: string;
  salt?: string;
  language?: string;
  backupCodesVerified?: boolean;
  type: EUserType;
  walletType: EWalletType;
  walletSubtype: EWalletSubType;
}

export interface IVerifyEmailUser {
  verificationCode: string;
}
export const GasStipendValidator = Yup.object()
  .shape({ gasStipend: Yup.number().required() })
  .required();

export const UserValidator = Yup.object()
  .shape({
    userId: Yup.string().required(),
    backupCodesVerified: Yup.boolean(),
    latestAcceptedTosIpfs: Yup.string(),
    language: Yup.string(),
    unverifiedEmail: Yup.string(),
    verifiedEmail: Yup.string(),
    type: Yup.string().oneOf(["investor", "issuer", "nominee"]),
    walletType: Yup.string().oneOf(Object.keys(EWalletType).map(type => type.toLowerCase())),
    walletSubtype: Yup.string().oneOf(Object.keys(EWalletSubType).map(type => type.toLowerCase())),
  })
  .required();

export const emailStatus = Yup.object().shape({
  isAvailable: Yup.boolean(),
});

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

const TxPendingExternalSchema = YupTS.object({
  transaction: TxSchema,
  transactionType: YupTS.string<typeof OOO_TRANSACTION_TYPE>(),
});

const TxPendingWithMetadataSchema = YupTS.object({
  transaction: TxSchema,
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

export type Tx = YupTS.TypeOf<typeof TxSchema>;
export type TxPendingExternal = YupTS.TypeOf<typeof TxPendingExternalSchema>;
export type TxPendingWithMetadata = YupTS.TypeOf<typeof TxPendingWithMetadataSchema> & {
  transactionAdditionalData?: any;
};
export type TPendingTxs = YupTS.TypeOf<typeof PendingTxsSchema>;
