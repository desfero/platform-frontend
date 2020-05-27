import { Tuple } from "@neufund/shared-utils";
import * as yup from "yup";

import { walletEthModuleApi } from "modules/eth/module";

import { singleValue, tupleSchema } from "utils/yupSchemas";

export const getJSONRPCSchema = <T extends string, U extends Tuple>(
  method: T,
  params: yup.Schema<U>,
) =>
  // We need to manually provide generics here otherwise typescript is not able to automatically
  // resolve T and U to a proper types (they are kept as generic values and we loose type-safety)
  yup.object<{
    id: number;
    jsonrpc: string;
    method: T;
    params: U;
  }>({
    id: yup.number().required(),
    jsonrpc: yup.string().required(),
    method: singleValue(method).required(),
    params,
  });

const SessionPeerMetaSchema = yup.object({
  description: yup.string(),
  url: yup.string().required(),
  icons: yup.array(yup.string().required()),
  name: yup.string().required(),
});

const SessionPeerSchema = yup.object({
  peerId: yup.string().required(),
  peerMeta: SessionPeerMetaSchema.required(),
});

export const WalletConnectSessionJSONRPCSchema = getJSONRPCSchema(
  "session_request" as const,
  tupleSchema([SessionPeerSchema.required()]).required(),
);

export const WalletConnectEthSignJSONRPCSchema = getJSONRPCSchema(
  "eth_sign" as const,
  tupleSchema([
    walletEthModuleApi.utils.ethereumAddress().required(),
    yup.string().required(),
  ]).required(),
);

const TransactionSchema = yup.object({
  to: walletEthModuleApi.utils.ethereumAddress().required(),
  gasPrice: yup.string().required(),
  gasLimit: yup.string().required(),
  value: yup.string().required(),
  data: yup.string().required(),
});

export type TTransactionSchema = yup.InferType<typeof TransactionSchema>;

export const WalletConnectEthSendTransactionJSONRPCSchema = getJSONRPCSchema(
  "eth_sendTransaction" as const,
  tupleSchema([TransactionSchema.required()]).required(),
);
