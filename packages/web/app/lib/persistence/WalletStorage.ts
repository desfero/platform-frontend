import { EUserType, ILogger } from "@neufund/shared-modules";
import { inject, injectable } from "inversify";

import { symbols } from "../../di/symbols";
import { TWalletMetadata } from "../../modules/web3/types";
import { ObjectStorage } from "./ObjectStorage";
import { Storage } from "./Storage";

export type TStoredWalletMetadata = TWalletMetadata & { userType: EUserType };

export const STORAGE_WALLET_METADATA_KEY = "NF_WALLET_METADATA";

@injectable()
export class WalletStorage {
  private walletMetadataStorage: ObjectStorage<TStoredWalletMetadata>;

  constructor(
    @inject(symbols.storage) private readonly storage: Storage,
    @inject(symbols.logger) private readonly logger: ILogger,
  ) {
    this.walletMetadataStorage = new ObjectStorage<TStoredWalletMetadata>(
      this.storage,
      this.logger,
      STORAGE_WALLET_METADATA_KEY,
    );
  }

  public async set(value: TStoredWalletMetadata): Promise<void> {
    await this.walletMetadataStorage.set(value);
  }

  public get(): Promise<TStoredWalletMetadata | undefined> {
    return this.walletMetadataStorage.get();
  }

  public async clear(): Promise<void> {
    await this.walletMetadataStorage.clear();
  }
}
