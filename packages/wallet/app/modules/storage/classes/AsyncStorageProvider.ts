import AsyncStorage from "@react-native-community/async-storage";
import { injectable } from "inversify";

import { ISecureStorageProvider } from "modules/storage/types/ISecureStorageProvider";

/**
 * A class implementing IAppStorageProvider for AsyncStorage provider library
 * @class  AsyncStorageProvider
 */
@injectable()
class AsyncStorageProvider implements ISecureStorageProvider {
  public provider: typeof AsyncStorage;
  constructor() {
    this.provider = AsyncStorage;
  }

  async setItem(key: string, value: string): Promise<void> {
    return this.provider.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return this.provider.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    return this.provider.removeItem(key);
  }

  async clear() {
    return this.provider.clear();
  }
}
export { AsyncStorageProvider };
