import { ILogger, noopLogger } from "@neufund/shared-modules";
import * as yup from "yup";

import { AppStorage } from "./AppStorage";
import { AsyncStorageProvider } from "./AsyncStorageProvider";
import { StorageItem } from "./StorageItem";
import { StorageSchema } from "./StorageSchema";

describe("AppStorage", () => {
  const PersonSchema = yup.object().shape({
    name: yup.string(),
    age: yup.number(),
  });

  // get a type for TS from Yup object
  type Person = yup.InferType<typeof PersonSchema>;
  let storage: AppStorage<Person>;
  const testKey = "testKey";
  let storageProvider: AsyncStorageProvider;
  let logger: ILogger;

  const personSchema = new StorageSchema(1, "PersonSchema", PersonSchema);

  beforeEach(() => {
    storageProvider = new AsyncStorageProvider();
    logger = noopLogger;
    storage = new AppStorage(storageProvider, logger, testKey, personSchema);
    storage.clear();
  });

  it("should return storage nameSpace", () => {
    expect(storage.getStorageKey()).toEqual(testKey);
  });

  it("should enforce schema to be registered", async () => {
    const key = "Superman";
    const value = {
      name: "Clark Kent",
      age: 33,
    };

    try {
      await storage.setItem(key, value);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it("should set a data item in storage", async () => {
    const key = "Superman";
    const value = {
      name: "Clark Kent",
      age: 33,
    };

    await storage.setItem(key, value);

    const item = await storage.getItem(key);

    expect(item?.data).toEqual(value);
  });

  it("should get data item in storage", async () => {
    const key = "Superman";
    const value = {
      name: "Clark Kent",
      age: 33,
    };

    await storage.setItem(key, value);
    const item = await storage.getItem(key);
    expect(item?.data).toEqual(value);
  });

  it("should remove data item from the storage", async () => {
    const key = "Superman";
    const value = {
      name: "Clark Kent",
      age: 33,
    };

    await storage.setItem(key, value);

    const item = await storage.getItem(key);

    expect(item?.data).toEqual(value);

    await storage.removeItem(key);

    const removedItem = await storage.getItem(key);

    expect(removedItem).toBeUndefined();
  });
});
