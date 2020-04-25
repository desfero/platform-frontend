import { ILogger, ISingleKeyStorage } from "@neufund/shared-modules";

import { IStorageItem } from "../types/IStorageItem";
import { IStorageSchema } from "../types/IStorageSchema";
import { AppStorage } from "./AppStorage";
import { AsyncStorageProvider } from "./AsyncStorageProvider";

/**
 * A class representing a single key application storage
 * @class  AppStorage
 * @todo Provide a factory to create single key storage so there is no need to manually provide logger and provider every time (allow to override provider)
 */
class AppSingleKeyStorage<DataType> implements ISingleKeyStorage<DataType> {
  protected storage: AppStorage<DataType>;
  protected key: string;

  constructor(
    provider: AsyncStorageProvider,
    logger: ILogger,
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
