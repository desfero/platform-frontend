import { ILogger, coreModuleApi } from "@neufund/shared-modules";
import { invariant } from "@neufund/shared-utils";
import { inject, injectable } from "inversify";

import { AppSingleKeyStorage } from "../../storage";
import { TSessionDetails, WalletConnectAdapter } from "./WalletConnectAdapter";
import { TWalletSession } from "./schemas";
import { privateSymbols } from "./symbols";
import { EWalletConnectAdapterEvents, TWalletConnectUri } from "./types";

/**
 * Controls the creation of wallet connect instances
 */
@injectable()
class WalletConnectManager {
  private readonly logger: ILogger;
  private readonly sessionStorage: AppSingleKeyStorage<TWalletSession>;

  constructor(
    @inject(coreModuleApi.symbols.logger) logger: ILogger,
    @inject(privateSymbols.walletConnectSessionStorage)
    sessionStorage: AppSingleKeyStorage<TWalletSession>,
  ) {
    this.logger = logger;
    this.sessionStorage = sessionStorage;
  }

  // TODO: Make sure we don't have a memory leak and events are cleaned up when disconnected
  private subscribeToConnectionEvents(adapter: WalletConnectAdapter) {
    adapter.on(EWalletConnectAdapterEvents.CONNECTED, async () => {
      await this.sessionStorage.set(adapter.getSession());
    });

    adapter.on(EWalletConnectAdapterEvents.DISCONNECTED, async () => {
      await this.sessionStorage.clear();
    });
  }

  async hasExistingSession(): Promise<boolean> {
    return !!(await this.sessionStorage.get());
  }

  async useExistingSession(): Promise<WalletConnectAdapter> {
    const sessionStorageItem = await this.sessionStorage.getStorageItem();
    invariant(sessionStorageItem, "No session in the storage");

    const adapter = new WalletConnectAdapter(
      {
        session: sessionStorageItem.data,
        connectedAt: sessionStorageItem.metadata.created,
      },
      this.logger,
    );

    this.subscribeToConnectionEvents(adapter);
    return adapter;
  }

  /**
   * Starts a handshake process between to peers
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

  async clearSession(){

  }
}

export { WalletConnectManager };
