import { IStorageMetaData } from "modules/storage/types/IStorageMetadata";

export class StorageMetaData implements IStorageMetaData {
  public appVersion: number;
  constructor(
    public created: number,
    public lastUpdated: number,
    public schemaId: string,
    public schemaVersion: number,
  ) {
    this.appVersion = 1; // replace with real app version getter
  }
}
