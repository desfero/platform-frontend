import { coreModuleApi, ILogger, ISingleKeyStorage } from "@neufund/shared-modules";
import { inject, injectable } from "inversify";

import { symbols } from "modules/storage/symbols";
import { IStorageItem } from "modules/storage/types/IStorageItem";
import { IStorageSchema } from "modules/storage/types/IStorageSchema";

import { AppStorage } from "./AppStorage";
import { AsyncStorageProvider } from "./AsyncStorageProvider";

/**
 * A class representing a single key application storage
 * @class  AppStorage
 */
@injectable()
class AppSingleKeyStorage<DataType> implements ISingleKeyStorage<DataType> {
  protected storage: AppStorage<DataType>;
  protected key: string;

  constructor(
    @inject(symbols.appStorageProvider) provider: AsyncStorageProvider,
    @inject(coreModuleApi.symbols.logger) logger: ILogger,
    storageKey: string,
    schema: IStorageSchema<DataType>,
  ) {
    this.storage = new AppStorage(provider, logger, storageKey, schema);
    this.key = storageKey;
  }

  async set(value: DataType): Promise<void> {
    await this.storage.setItem(this.key, value);
  }

  async getStorageItem(): Promise<IStorageItem<DataType> | undefined> {
    return this.storage.getItem(this.key);
  }

  async get(): Promise<DataType | undefined> {
    const storageItem = await this.getStorageItem();

    return storageItem ? storageItem.data : undefined;
  }

  async clear(): Promise<void> {
    await this.storage.removeItem(this.key);
  }
}

export { AppSingleKeyStorage };
