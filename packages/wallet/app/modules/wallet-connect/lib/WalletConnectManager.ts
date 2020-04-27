import { ILogger, coreModuleApi } from "@neufund/shared-modules";
import { invariant } from "@neufund/shared-utils";
import { inject, injectable } from "inversify";

import { SessionStorageAdapter } from "./SessionStorageAdapter";
import { TSessionDetails, WalletConnectAdapter } from "./WalletConnectAdapter";
import { privateSymbols } from "./symbols";
import { EWalletConnectManagerEvents, TWalletConnectUri } from "./types";

/**
 * Controls the creation of wallet connect instances
 */
@injectable()
class WalletConnectManager {
  private readonly logger: ILogger;
  private readonly sessionStorage: SessionStorageAdapter;

  constructor(
    @inject(coreModuleApi.symbols.logger) logger: ILogger,
    @inject(privateSymbols.walletConnectSessionStorage) sessionStorage: SessionStorageAdapter,
  ) {
    this.logger = logger;
    this.sessionStorage = sessionStorage;
  }

  async hasExistingSession(): Promise<boolean> {
    return !!(await this.sessionStorage.getSession());
  }

  async useExistingSession(): Promise<WalletConnectAdapter> {
    const session = await this.sessionStorage.getSession();

    invariant(session, "No session in the storage");

    const adapter = new WalletConnectAdapter(
      {
        session,
      },
      this.logger,
    );

    this.subscribeToConnectionEvents(adapter);

    return adapter;
  }

  /**
   * Starts a handshake process between to peers
   *
   * @returns A session details object with meta functions to approve or reject session request
   */
  async createSession(uri: TWalletConnectUri): Promise<TSessionDetails> {
    const walletConnectAdapter = new WalletConnectAdapter(
      {
        uri,
      },
      this.logger,
    );

    this.subscribeToConnectionEvents(walletConnectAdapter);

    return walletConnectAdapter.connect();
  }

  // TODO: Make sure we don't have a memory leak and events are cleaned up when disconnected
  private subscribeToConnectionEvents(adapter: WalletConnectAdapter) {
    adapter.on(EWalletConnectManagerEvents.CONNECTED, async () => {
      await this.sessionStorage.setSession(adapter.getSession());
    });

    adapter.on(EWalletConnectManagerEvents.DISCONNECTED, async () => {
      await this.sessionStorage.removeSession();
    });
  }
}

export { WalletConnectManager };
