import { EthereumAddressWithChecksum } from "@neufund/shared-utils";

import { TTransactionRequestRequired } from "../eth/lib/types";

enum ESignerType {
  WC_SESSION_REQUEST = "wc_session_request",
  SIGN_MESSAGE = "sign_message",
  SEND_TRANSACTION = "send_transaction",
}

type TWCSessionRequestPayload = {
  peerId: string;
  peerName: string;
  peerUrl: string;
};

type TWCSessionResponsePayload = {
  address: EthereumAddressWithChecksum;
  chainId: number;
};

type TSignRequestPayload = {
  digest: string;
};

type TSignResponsePayload = {
  signedData: string;
};

type TSendTransactionRequestPayload = {
  transaction: TTransactionRequestRequired;
};

type TSendTransactionResponsePayload = {
  transactionHash: string;
};

export type TSignerRequestData = {
  [ESignerType.WC_SESSION_REQUEST]: TWCSessionRequestPayload;
  [ESignerType.SIGN_MESSAGE]: TSignRequestPayload;
  [ESignerType.SEND_TRANSACTION]: TSendTransactionRequestPayload;
};

export type TSignerResponseData = {
  [ESignerType.WC_SESSION_REQUEST]: TWCSessionResponsePayload;
  [ESignerType.SIGN_MESSAGE]: TSignResponsePayload;
  [ESignerType.SEND_TRANSACTION]: TSendTransactionResponsePayload;
};

export type TSignerSignPayload =
  | {
      type: ESignerType.SEND_TRANSACTION;
      data: TSignerRequestData[ESignerType.SEND_TRANSACTION];
    }
  | {
      type: ESignerType.SIGN_MESSAGE;
      data: TSignerRequestData[ESignerType.SIGN_MESSAGE];
    }
  | {
      type: ESignerType.WC_SESSION_REQUEST;
      data: TSignerRequestData[ESignerType.WC_SESSION_REQUEST];
    };

export type TSignerSignedPayload =
  | {
      type: ESignerType.SEND_TRANSACTION;
      data: TSignerResponseData[ESignerType.SEND_TRANSACTION];
    }
  | {
      type: ESignerType.SIGN_MESSAGE;
      data: TSignerResponseData[ESignerType.SIGN_MESSAGE];
    }
  | {
      type: ESignerType.WC_SESSION_REQUEST;
      data: TSignerResponseData[ESignerType.WC_SESSION_REQUEST];
    };

export { ESignerType };
