import { coreModuleApi, ILogger } from "@neufund/shared-modules";
import { EthereumAddress } from "@neufund/shared-utils";
import WalletConnect from "@walletconnect/react-native";
import { IClientMeta } from "@walletconnect/types";
import { EventEmitter2 } from "eventemitter2";
import { interfaces } from "inversify";

import { unwrapPromise } from "../../../utils/promiseUtils";
import { WalletConnectModuleError } from "../errors";
import { TWalletConnectPeer } from "../types";
import {
  CALL_REQUEST_EVENT,
  DISCONNECT_EVENT,
  ETH_SEND_TRANSACTION_RPC_METHOD,
  ETH_SIGN_RPC_METHOD,
  SESSION_REQUEST_EVENT,
  walletConnectClientMeta,
} from "./constants";
import {
  WalletConnectEthSendTransactionJSONRPCSchema,
  WalletConnectEthSignJSONRPCSchema,
  WalletConnectSessionJSONRPCSchema,
} from "./schemas";
import {
  EWalletConnectManagerEvents,
  ExtractWalletConnectManagerEmitData,
  TWalletConnectUri,
} from "./types";
import { parseRPCPayload } from "./utils";

class WalletConnectManagerError extends WalletConnectModuleError {
  constructor(message: string) {
    super(`WalletConnectManager: ${message}`);
  }
}

class InvalidRPCMethodError extends WalletConnectManagerError {
  constructor(method: string) {
    super(`Invalid RPC method received (${method})`);
  }
}

class NoPeerMetaError extends WalletConnectManagerError {
  constructor() {
    super("No peer meta provided");
  }
}

class InvalidJSONRPCPayloadError extends WalletConnectManagerError {
  constructor(method: string) {
    super(`Invalid json rpc payload received for ${method}`);
  }
}

type TSessionDetails = {
  peer: TWalletConnectPeer;
  approveSession: (chainId: number, address: EthereumAddress) => void;
  rejectSession: () => void;
};

/**
 * Wraps wallet connect class to simplify interface and to provide type safety
 *
 * @internal EthWallet should only be used as a factory and never exposed to DI container
 */
class WalletConnectManager extends EventEmitter2 {
  private readonly logger: ILogger;

  private readonly walletConnect: WalletConnect;

  constructor(uri: TWalletConnectUri, logger: ILogger) {
    super();

    this.logger = logger;

    this.walletConnect = new WalletConnect(
      {
        uri,
      },
      {
        clientMeta: walletConnectClientMeta,
      },
    );
  }

  /**
   * Gets connected peer id
   */
  getPeerId(): string {
    return this.walletConnect.peerId;
  }

  /**
   * Gets currently connected peer metadata
   *
   * @throws NoPeerMetaError - When no metadata found
   */
  getPeerMeta(): IClientMeta {
    if (!this.walletConnect.peerMeta) {
      throw new NoPeerMetaError();
    }

    return this.walletConnect.peerMeta;
  }

  /**
   * Starts a handshake process between to peers
   *
   * @returns A session details object with meta functions to approve or reject session request
   */
  async createSession(): Promise<TSessionDetails> {
    await this.walletConnect.createSession();

    return new Promise((resolve, reject) => {
      this.walletConnect.on(SESSION_REQUEST_EVENT, async (error, payload) => {
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

            this.initializeListeners();
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
      });
    });
  }

  /**
   * Disconnects currently active session
   */
  async disconnectSession() {
    this.logger.info(`Disconnecting wallet connect session with peer ${this.getPeerId()}`);

    await this.walletConnect.killSession();
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
              EWalletConnectManagerEvents.SIGN_MESSAGE,
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
              EWalletConnectManagerEvents.SEND_TRANSACTION,
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

    this.walletConnect.on(DISCONNECT_EVENT, () => {
      this.emit(EWalletConnectManagerEvents.DISCONNECT, undefined, undefined, undefined);
    });
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
      | EWalletConnectManagerEvents.SIGN_MESSAGE
      | EWalletConnectManagerEvents.SEND_TRANSACTION
  >(type: T, id: number, payload: ExtractWalletConnectManagerEmitData<T, "payload">) {
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
}

const walletConnectManagerFactory = (context: interfaces.Context) => {
  const logger = context.container.get<ILogger>(coreModuleApi.symbols.logger);

  return (uri: TWalletConnectUri) => new WalletConnectManager(uri, logger);
};

export type TWalletConnectManagerFactoryType = ReturnType<typeof walletConnectManagerFactory>;

export {
  walletConnectManagerFactory,
  WalletConnectManager,
  NoPeerMetaError,
  WalletConnectManagerError,
  InvalidRPCMethodError,
  InvalidJSONRPCPayloadError,
};
