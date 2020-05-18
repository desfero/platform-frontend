import { ILogger } from "@neufund/shared-modules";
import { EthereumAddress } from "@neufund/shared-utils";
import WalletConnect from "@walletconnect/react-native";
import { IWalletConnectSession } from "@walletconnect/types";
import { EventEmitter2 } from "eventemitter2";

import { unwrapPromise } from "../../../utils/promiseUtils";
import { TWalletConnectPeer } from "../types";
import {
  InvalidJSONRPCPayloadError,
  InvalidRPCMethodError,
  NoPeerMetaError,
  WalletConnectAdapterError,
} from "./adapterErrors";
import {
  CALL_REQUEST_EVENT,
  CONNECT_EVENT,
  DISCONNECT_EVENT,
  ETH_SEND_TRANSACTION_RPC_METHOD,
  ETH_SIGN_RPC_METHOD,
  SESSION_REQUEST_EVENT,
  walletConnectClientMeta,
} from "./constants";
import {
  TPeerMeta,
  WalletConnectEthSendTransactionJSONRPCSchema,
  WalletConnectEthSignJSONRPCSchema,
  WalletConnectSessionJSONRPCSchema,
} from "./schemas";
import {
  EWalletConnectAdapterEvents,
  ExtractWalletConnectAdapterEmitData,
  IWalletConnectOptions,
} from "./types";
import { parseRPCPayload } from "./utils";

export type TSessionDetails = {
  peer: TWalletConnectPeer;
  approveSession: (chainId: number, address: EthereumAddress) => WalletConnectAdapter;
  rejectSession: () => void;
};

/**
 * Wraps wallet connect class to simplify interface and to provide type safety
 *
 * @internal WalletConnectAdapter should only be used in WalletConnectManager and never exposed to DI container
 */
class WalletConnectAdapter extends EventEmitter2 {
  private readonly logger: ILogger;
  private readonly walletConnect: WalletConnect;
  private connectedAt: number | undefined = undefined;

  constructor(options: IWalletConnectOptions, logger: ILogger) {
    super();
    this.logger = logger;

    this.walletConnect = new WalletConnect(
      {
        uri: options.uri,
        session: options.session,
      },
      {
        clientMeta: walletConnectClientMeta,
      },
    );

    // if we instantiate connection from the session we know the session creation date
    // otherwise set the connected timestamp after connection is established and session approved
    if (options.session) {
      this.connectedAt = options.connectedAt;
    }

    this.initializeListeners();
  }

  private handleCallSigningError(id: number, error: Error) {
    this.logger.error("Wallet connect call signing error", error);

    this.walletConnect.rejectRequest({
      id,
      error: error ?? new Error("Request rejected"),
    });
  }

  private async handleCallSigningRequest<
    T extends
      | EWalletConnectAdapterEvents.SIGN_MESSAGE
      | EWalletConnectAdapterEvents.SEND_TRANSACTION
  >(type: T, id: number, payload: ExtractWalletConnectAdapterEmitData<T, "payload">) {
    const {
      promise: signRequest,
      resolve: approveRequest,
      reject: rejectRequest,
    } = unwrapPromise();

    this.emit(type, undefined, payload, {
      approveRequest,
      rejectRequest,
    });

    try {
      const result = await signRequest;

      this.walletConnect.approveRequest({
        id,
        result,
      });
    } catch (error) {
      this.walletConnect.rejectRequest({
        id,
        error: error ?? new Error("Request rejected"),
      });
    }
  }

  private initializeListeners() {
    this.walletConnect.on(CALL_REQUEST_EVENT, async (error, payload) => {
      if (error) {
        this.logger.error("Wallet connect call request error", error);
        return;
      }

      switch (payload.method) {
        case ETH_SIGN_RPC_METHOD:
          try {
            const parsedPayload = parseRPCPayload(WalletConnectEthSignJSONRPCSchema, payload);

            await this.handleCallSigningRequest(
              EWalletConnectAdapterEvents.SIGN_MESSAGE,
              parsedPayload.id,
              {
                digest: parsedPayload.params[1],
              },
            );
          } catch (e) {
            this.handleCallSigningError(payload.id, new InvalidJSONRPCPayloadError(payload.method));
          }
          break;

        case ETH_SEND_TRANSACTION_RPC_METHOD:
          try {
            const parsedPayload = parseRPCPayload(
              WalletConnectEthSendTransactionJSONRPCSchema,
              payload,
            );

            await this.handleCallSigningRequest(
              EWalletConnectAdapterEvents.SEND_TRANSACTION,
              parsedPayload.id,
              {
                transaction: parsedPayload.params[0],
              },
            );
          } catch (e) {
            this.handleCallSigningError(payload.id, new InvalidJSONRPCPayloadError(payload.method));
          }
          break;

        default:
          this.handleCallSigningError(payload.id, new InvalidRPCMethodError(payload.method));
          break;
      }
    });

    this.walletConnect.on(CONNECT_EVENT, () => {
      this.connectedAt = Date.now();
      this.emit(EWalletConnectAdapterEvents.CONNECTED, undefined, undefined, undefined);
    });

    this.walletConnect.on(DISCONNECT_EVENT, () => {
      this.emit(EWalletConnectAdapterEvents.DISCONNECTED, undefined, undefined, undefined);
    });
  }

  destory() {
    this.removeAllListeners();
  }

  /**
   * Gets connected peer id
   */
  getPeerId(): string {
    return this.walletConnect.peerId;
  }

  /**
   * Gets currently connected peer metadata
   * @throws NoPeerMetaError - When no metadata found
   */
  getPeerMeta(): TPeerMeta {
    if (!this.walletConnect.peerMeta) {
      throw new NoPeerMetaError();
    }

    return this.walletConnect.peerMeta;
  }

  /**
   * Get connected timestamp
   **/
  getConnectedAt(): number | undefined {
    return this.connectedAt;
  }

  /**
   * Starts a handshake process between to peers
   * @returns A session details object with meta functions to approve or reject session request
   */
  async connect(): Promise<TSessionDetails> {
    return new Promise((resolve, reject) => {
      const callback = async (error: Error | null, payload: unknown | null) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          const parsedPayload = parseRPCPayload(WalletConnectSessionJSONRPCSchema, payload);
          const peerData = parsedPayload.params[0];

          const peer: TWalletConnectPeer = {
            id: peerData.peerId,
            meta: peerData.peerMeta,
          };

          const approveSession = (chainId: number, address: EthereumAddress) => {
            this.walletConnect.approveSession({
              chainId,
              accounts: [address],
            });

            return this;
          };

          const rejectSession = () => {
            this.walletConnect.rejectSession();
          };

          resolve({
            peer,
            approveSession,
            rejectSession,
          });
        } catch {
          reject(new InvalidJSONRPCPayloadError(SESSION_REQUEST_EVENT));
          return;
        }
      };

      this.walletConnect.on(SESSION_REQUEST_EVENT, callback);
    });
  }

  /**
   * Get a current wallet connect session
   */
  getSession(): IWalletConnectSession {
    return this.walletConnect.session;
  }

  /**
   * Disconnects currently active session
   */
  async disconnectSession() {
    this.logger.info(`Disconnecting wallet connect session with peer ${this.getPeerId()}`);
    await this.walletConnect.killSession();
  }
}

export {
  WalletConnectAdapter,
  NoPeerMetaError,
  WalletConnectAdapterError,
  InvalidRPCMethodError,
  InvalidJSONRPCPayloadError,
};
