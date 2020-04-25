import { coreModuleApi, ILogger } from "@neufund/shared-modules";
import { IWalletConnectSession } from "@walletconnect/types";
import { inject, injectable } from "inversify";

import { AppSingleKeyStorage, AsyncStorageProvider, symbols } from "../../storage";
import { WALLET_CONNECT_SESSION_KEY } from "./constants";
import { TWalletSession, WalletSessionStorageSchema } from "./schemas";

@injectable()
class SessionStorageAdapter {
  protected readonly storage: AppSingleKeyStorage<TWalletSession>;

  constructor(
    @inject(symbols.appStorageProvider) provider: AsyncStorageProvider,
    @inject(coreModuleApi.symbols.logger) logger: ILogger,
  ) {
    this.storage = new AppSingleKeyStorage(
      provider,
      logger,
      WALLET_CONNECT_SESSION_KEY,
      WalletSessionStorageSchema,
    );
  }

  async getSession(): Promise<IWalletConnectSession | null> {
    const session = await this.storage.get();

    return session ?? null;
  }

  async setSession(session: IWalletConnectSession): Promise<IWalletConnectSession> {
    await this.storage.set(session);

    return session;
  }

  async removeSession(): Promise<void> {
    await this.storage.clear();
  }
}

export { SessionStorageAdapter };
