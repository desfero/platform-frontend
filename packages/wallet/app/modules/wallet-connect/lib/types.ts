import { Opaque, XOR } from "@neufund/shared-utils";

import { TTransactionSchema, TWalletSession } from "./schemas";

export type TWalletConnectUri = Opaque<"WalletConnectUri", string>;

export type IWalletConnectOptions = XOR<
  {
    uri: TWalletConnectUri;
  },
  { session: TWalletSession; connectedAt: number }
>;

export enum EWalletConnectAdapterEvents {
  SIGN_MESSAGE = "sign_message",
  SEND_TRANSACTION = "send_transaction",
  DISCONNECTED = "disconnected",
  CONNECTED = "connected",
}

export type TWalletConnectAdapterEmit =
  | {
      type: EWalletConnectAdapterEvents.SIGN_MESSAGE;
      payload: {
        digest: string;
      };
      meta: {
        approveRequest: (signedMessage: string) => void;
        rejectRequest: () => void;
      };
      error: undefined;
    }
  | {
      type: EWalletConnectAdapterEvents.SEND_TRANSACTION;
      payload: {
        transaction: TTransactionSchema;
      };
      meta: {
        approveRequest: (transactionHash: string) => void;
        rejectRequest: () => void;
      };
      error: undefined;
    }
  | {
      type: EWalletConnectAdapterEvents.DISCONNECTED;
      payload: undefined;
      meta: undefined;
      error: undefined;
    }
  | {
      type: EWalletConnectAdapterEvents.CONNECTED;
      payload: undefined;
      meta: undefined;
      error: undefined;
    };

export type ExtractWalletConnectAdapterEmitData<
  T extends EWalletConnectAdapterEvents,
  F extends string
> = Extract<TWalletConnectAdapterEmit, { type: T }> extends { [k in F]: infer E } ? E : never;
