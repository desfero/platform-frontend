import { Schema } from "yup";

import { IStorageSchema } from "../types/IStorageSchema";
import { ApplicationStorageError } from "./ApplicationStorageError";

export class NoMigrationPathError extends ApplicationStorageError {
  constructor(schemaId: string, fromVersion: number, toVersion: number) {
    super(
      `NoMigrationPathError: no migration path for schema ${schemaId} from version ${fromVersion} to ${toVersion}`,
    );
  }
}

/**
 * Class representing a schema item
 * @class  StorageSchema
 */
export class StorageSchema<DataType> implements IStorageSchema<DataType> {
  /**
   * @param {string} version - version of a schema
   * @param {string} id - schema id
   * @param schema - YupTS object schema
   */
  constructor(public version: number, public id: string, public schema: Schema<DataType>) {}

  /**
   * @param {DataType} data - validate data with YUP
   * returns boolean promise
   */
  async validate(data: DataType): Promise<DataType> {
    return this.schema.validate(data);
  }

  /**
   * @param {number} storageVersion - version of the data in the storage
   * @param {DataType} data - data in the storage
   * returns data migrated to the current version as required by schema
   */
  async migrate(storageVersion: number, data: DataType): Promise<DataType> {
    if (this.version !== storageVersion) {
      throw new NoMigrationPathError(this.id, storageVersion, this.version);
    }
    return Promise.resolve(data);
  }
}

export type TStorageSchemaDataType<T extends StorageSchema<unknown>> = T extends StorageSchema<
  infer R
>
  ? R
  : never;
