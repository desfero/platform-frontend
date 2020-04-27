import { Opaque, XOR } from "@neufund/shared-utils";

import { TTransactionSchema, TWalletSession } from "./schemas";

export type TWalletConnectUri = Opaque<"WalletConnectUri", string>;

export type IWalletConnectOptions = XOR<
  {
    uri: TWalletConnectUri;
  },
  { session: TWalletSession }
>;

export enum EWalletConnectManagerEvents {
  SIGN_MESSAGE = "sign_message",
  SEND_TRANSACTION = "send_transaction",
  DISCONNECTED = "disconnected",
  CONNECTED = "connected",
}

export type TWalletConnectManagerEmit =
  | {
      type: EWalletConnectManagerEvents.SIGN_MESSAGE;
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
      type: EWalletConnectManagerEvents.SEND_TRANSACTION;
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
      type: EWalletConnectManagerEvents.DISCONNECTED;
      payload: undefined;
      meta: undefined;
      error: undefined;
    }
  | {
      type: EWalletConnectManagerEvents.CONNECTED;
      payload: undefined;
      meta: undefined;
      error: undefined;
    };

export type ExtractWalletConnectManagerEmitData<
  T extends EWalletConnectManagerEvents,
  F extends string
> = Extract<TWalletConnectManagerEmit, { type: T }> extends { [k in F]: infer E } ? E : never;
