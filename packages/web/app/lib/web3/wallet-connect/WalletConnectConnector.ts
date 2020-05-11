import { clearSafeTimeout, safeSetTimeout } from "@neufund/shared-utils";
import { Web3Manager } from "@neufund/web/app/lib/web3/Web3Manager/Web3Manager";
import { IConnector, ISessionStatus } from "@walletconnect/types";
import { EventEmitter } from "events";
import { inject, injectable } from "inversify";
import * as Web3 from "web3";
import * as Web3ProviderEngine from "web3-provider-engine";
import * as RpcSubprovider from "web3-provider-engine/subproviders/rpc";

import { ILogger } from "../../../../../shared-modules/dist/modules/core/lib/logger/ILogger";
import { WC_DEFAULT_SESSION_REQUEST_TIMEOUT } from "../../../config/constants";
import { symbols } from "../../../di/symbols";
import { NullBlockTracker } from "../../api/nullBlockTracker";
import { WalletError } from "../errors";
import { IPersonalWallet } from "../PersonalWeb3";
import { IEthereumNetworkConfig } from "../types";
import { Web3Adapter } from "../Web3Adapter";
import { WalletConnectSubprovider } from "./WalletConnectSubprovider";
import {
  WalletConnectChainIdError,
  WalletConnectGenericError,
  WalletConnectSessionRejectedError,
  WalletConnectWallet,
} from "./WalletConnectWallet";

export type TWalletConnectEvents =
  | { type: EWalletConnectEventTypes.SESSION_REQUEST; payload: { uri: string } }
  | { type: EWalletConnectEventTypes.SESSION_REQUEST_TIMEOUT }
  | { type: EWalletConnectEventTypes.DISCONNECT }
  | { type: EWalletConnectEventTypes.REJECT }
  | { type: EWalletConnectEventTypes.CONNECT }
  | { type: EWalletConnectEventTypes.ERROR; payload: { error: Error } };

export enum EWalletConnectEventTypes {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  REJECT = "reject",
  ERROR = "error",
  SESSION_REQUEST = "sessionRequest",
  SESSION_REQUEST_TIMEOUT = "sessionRequestTimeout",
}

@injectable()
export class WalletConnectConnector extends EventEmitter {
  private walletConnector: IConnector | undefined;
  private sessionRequestTimeout: number | undefined;

  public constructor(
    @inject(symbols.ethereumNetworkConfig)
    public readonly web3Config: IEthereumNetworkConfig,
    @inject(symbols.logger)
    public readonly logger: ILogger,
    @inject(symbols.web3Manager)
    public readonly web3Manager: Web3Manager,
  ) {
    super();
  }

  public connect = async (): Promise<IPersonalWallet> => {
    const walletConnectProvider = new WalletConnectSubprovider({
      bridge: this.web3Config.bridgeUrl,
      qrcode: true,
    });

    try {
      const engine = new Web3ProviderEngine({ blockTracker: new NullBlockTracker() });

      engine.addProvider(walletConnectProvider);
      engine.addProvider(
        new RpcSubprovider({
          rpcUrl: this.web3Config.rpcUrl,
        }),
      );
      engine.start();
      engine.stop();

      // todo: connect display_uri event to generate QR code in place instead of using built in modal
      // for now use it for timeout
      this.walletConnector = walletConnectProvider.walletConnector;
      this.walletConnector.on("display_uri", this.sessionRequestHandler);
      // returns succesfully connected wallet and emits QR code events
      await walletConnectProvider.getConnectedConnector();
      // there no way to usubscribe from walletConnector events
      const session = this.walletConnector.session;

      // check chain id
      if (parseInt(this.web3Manager.networkId, 10) !== session.chainId) {
        throw new WalletConnectChainIdError(session.chainId);
      }

      const web3 = new Web3(engine);
      const web3Adapter = new Web3Adapter(web3);

      const ethereumAddress = await web3Adapter.getAccountAddressWithChecksum();
      if (this.sessionRequestTimeout) {
        clearSafeTimeout(this.sessionRequestTimeout);
      }

      this.connectHandler(session);
      this.walletConnector.on("disconnect", this.disconnectHandler);
      this.walletConnector.on("session_update", this.sessionUpdateHandler);

      return new WalletConnectWallet(
        web3Adapter,
        ethereumAddress,
        this.walletConnector,
        session.peerMeta,
      );
    } catch (e) {
      this.logger.error("could not enable wc", e);
      await this.cancelSession();
      if (e instanceof WalletError) {
        throw e;
      }
      if (e instanceof Error && e.message === "client rejected") {
        this.rejectHandler();
        throw new WalletConnectSessionRejectedError("subscription failed");
      } else {
        throw new WalletConnectGenericError(e);
      }
    }
  };

  public cancelSession = async () => {
    if (this.walletConnector) {
      await this.walletConnector.killSession();
    }
    this.cleanUpSession();
  };

  private cleanUpSession = () => {
    this.walletConnector = undefined;
    if (this.sessionRequestTimeout) {
      clearSafeTimeout(this.sessionRequestTimeout);
    }
  };

  private sessionUpdateHandler = (error: any, _: ISessionStatus) => {
    if (error) {
      this.emit(EWalletConnectEventTypes.ERROR, { error });
    } else {
      // TODO: check chain id && user account but currently just disconnect
      this.emit(EWalletConnectEventTypes.DISCONNECT);
    }
  };

  private connectHandler = (_: ISessionStatus) => {
    // todo: we can emit peer info here on connect
    this.emit(EWalletConnectEventTypes.CONNECT);
  };

  private disconnectHandler = () => {
    this.cleanUpSession();
    this.emit(EWalletConnectEventTypes.DISCONNECT);
  };

  private rejectHandler = () => {
    this.emit(EWalletConnectEventTypes.REJECT);
  };

  private sessionRequestHandler = (_: any, uri: string) => {
    this.sessionRequestTimeout = safeSetTimeout(
      this.sessionRequestTimeoutHandler,
      WC_DEFAULT_SESSION_REQUEST_TIMEOUT,
    );

    this.emit(EWalletConnectEventTypes.SESSION_REQUEST, uri);
  };

  private sessionRequestTimeoutHandler = () => {
    this.sessionRequestTimeout && clearSafeTimeout(this.sessionRequestTimeout);
    this.sessionRequestTimeout = undefined;
    // reject session for which QR code is shown
    this.walletConnector!.rejectSession();
    this.emit(EWalletConnectEventTypes.SESSION_REQUEST_TIMEOUT);
  };
}
