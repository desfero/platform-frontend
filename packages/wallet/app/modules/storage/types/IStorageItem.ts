import { IStorageMetaData } from "./IStorageMetadata";

/**
 * An interface that represents a storage data item
 * @interface  IStorageItem
 */
export interface IStorageItem<DataType> {
  /**
   * @property {DataType} data - serializable data.
   */
  data: DataType;

  /**
   * @property {number} metadata - additional information about data.
   */
  metadata: IStorageMetaData;
}
