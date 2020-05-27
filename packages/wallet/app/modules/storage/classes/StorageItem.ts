import { IStorageItem } from "modules/storage/types/IStorageItem";

import { StorageMetaData } from "./StorageMetaData";

/**
 * Class representing a unit of storage data
 * @class  StorageSchema
 */
export class StorageItem<DataType> implements IStorageItem<DataType> {
  constructor(public data: DataType, public metadata: StorageMetaData) {}
}
