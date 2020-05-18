import { coreModuleApi, ILogger } from "@neufund/shared-modules";
import { injectable, inject } from "inversify";

import { symbols } from "../symbols";
import { IStorageItem } from "../types/IStorageItem";
import { IStorageSchema } from "../types/IStorageSchema";
import { ApplicationStorageError } from "./ApplicationStorageError";
import { AsyncStorageProvider } from "./AsyncStorageProvider";
import { SchemaMismatchError } from "./SchemaMismatchError";
import { StorageItem } from "./StorageItem";
import { StorageMetaData } from "./StorageMetaData";

/**
 * A class representing an application storage
 * @class  AppStorage
 */
@injectable()
class AppStorage<DataType> {
  protected readonly logger: ILogger;

  /**
   * Storage namespace. Namespace allows easier migrations and data separation.
   */
  protected readonly storageKey: string;

  /**
   * Schema storage instance.
   */
  protected readonly schema: IStorageSchema<DataType>;

  /**
   * Storage provider instance.
   */
  protected readonly provider: AsyncStorageProvider;

  constructor(
    @inject(symbols.appStorageProvider) provider: AsyncStorageProvider,
    @inject(coreModuleApi.symbols.logger) logger: ILogger,
    storageKey: string,
    schema: IStorageSchema<DataType>,
  ) {
    this.provider = provider;
    this.schema = schema;
    this.storageKey = storageKey;
    this.logger = logger;

    this.logger.info(`AppStorage initialized with key: ${storageKey}`);
  }

  /**
   * Get storage namespace
   */
  getStorageKey(): string {
    this.logger.info(`Getting storage name key`);

    return this.storageKey;
  }

  /**
   * Save item to storage.
   * @param {string} key - Key to access the value.
   * @param {string} value - Value to save.
   */
  async setItem(key: string, value: DataType): Promise<void> {
    this.logger.info(`Setting a storage item for: ${key}`);

    // get the schema by id
    const schema = this.schema;

    if (!schema) {
      throw new ApplicationStorageError(`Schema not found`);
    }

    // Create metadata
    const metadata = new StorageMetaData(Date.now(), Date.now(), schema.id, schema.version);

    // create storage item
    const storageItem = new StorageItem(value, metadata);

    // validate data schema and throw and error if it's invalid.
    try {
      await schema.validate(storageItem.data);
    } catch (error) {
      throw new SchemaMismatchError(schema, error.errors);
    }

    let data;

    // transform tha data into json string
    try {
      data = JSON.stringify(storageItem);
    } catch (error) {
      throw new ApplicationStorageError(error);
    }

    // save data to the storage provider
    try {
      await this.provider.setItem(`${this.storageKey}:${key}`, data);
    } catch (error) {
      throw new ApplicationStorageError(error);
    }
  }

  /**
   * Get item from storage.
   * @param {string} key - Key to access the value.
   */
  async getItem(key: string): Promise<IStorageItem<DataType> | undefined> {
    this.logger.info(`Getting a storage item for: ${key}`);

    let value;
    try {
      // get a raw json string from the storage provider
      value = await this.provider.getItem(`${this.storageKey}:${key}`);

      if (!value) {
        return undefined;
      }
    } catch (error) {
      throw new ApplicationStorageError(error);
    }

    const schema = this.schema;

    // try to parse json, if not throw an error
    let deserialized;
    try {
      deserialized = JSON.parse(value);
    } catch (error) {
      throw new ApplicationStorageError(error);
    }

    // destructure item metadata
    const {
      created,
      lastUpdated,
      schemaId,
      schemaVersion: storedSchemaVersion,
    } = deserialized.metadata;

    // always run migrate function to ensure proper data version according to the schema
    const migrated: DataType = await schema.migrate(storedSchemaVersion, deserialized.data);

    const storageItem: StorageItem<DataType> = new StorageItem<DataType>(
      migrated,
      new StorageMetaData(created, lastUpdated, schemaId, storedSchemaVersion),
    );

    return storageItem;
  }

  /**
   * Remove item from storage.
   * @param {string} key - Key to remove the value.
   */
  async removeItem(key: string): Promise<void> {
    this.logger.info(`Removing a storage item for: ${key}`);

    await this.provider.removeItem(`${this.storageKey}:${key}`);
  }

  /**
   * Remove all data from storage.
   */
  async clear(): Promise<void> {
    this.logger.info(`Cleaning the storage`);

    await this.provider.clear();
  }
}

export { AppStorage };
