import { ISecureStorage, AsyncSecureStorage, KeychainSecureStorage } from "./SecureStorage";

/**
 * Write some  basic tests to ensure the used caching lib works the way we expect
 */
describe("SecureStorage", () => {
  describe("Test async secure storage", () => {
    const storage: ISecureStorage = new AsyncSecureStorage();

    it("Should save read and delete values", async () => {
      const value1 = "value1";
      const value2 = "value2";

      const ref1 = await storage.setSecret(value1);
      const ref2 = await storage.setSecret(value2);

      // values should be stored
      expect(await storage.getSecret(ref1)).toBe(value1);
      expect(await storage.getSecret(ref2)).toBe(value2);
      expect(await storage.hasSecret(ref1)).toBe(true);
      expect(await storage.hasSecret(ref2)).toBe(true);

      // delete one value
      await storage.deleteSecret(ref1);
      expect(await storage.getSecret(ref1)).toBe(null);
      expect(await storage.getSecret(ref2)).toBe(value2);
      expect(await storage.hasSecret(ref1)).toBe(false);
      expect(await storage.hasSecret(ref2)).toBe(true);

      // delete another value
      await storage.deleteSecret(ref2);
      expect(await storage.getSecret(ref1)).toBe(null);
      expect(await storage.getSecret(ref2)).toBe(null);
      expect(await storage.hasSecret(ref1)).toBe(false);
      expect(await storage.hasSecret(ref2)).toBe(false);
    });
  });

  describe("Test keychain secure storage", () => {
    it("Should save read and delete values", async () => {
      const storage: ISecureStorage = new KeychainSecureStorage(true);

      const value1 = "value1";
      const value2 = "value2";

      const ref1 = await storage.setSecret(value1);
      const ref2 = await storage.setSecret(value2);

      // values should be stored
      expect(await storage.getSecret(ref1)).toBe(value1);
      expect(await storage.getSecret(ref2)).toBe(value2);
      expect(await storage.hasSecret(ref1)).toBe(true);
      expect(await storage.hasSecret(ref2)).toBe(true);

      // delete one value
      await storage.deleteSecret(ref1);
      expect(await storage.getSecret(ref1)).toBe(null);
      expect(await storage.getSecret(ref2)).toBe(value2);
      expect(await storage.hasSecret(ref1)).toBe(false);
      expect(await storage.hasSecret(ref2)).toBe(true);

      // delete another value
      await storage.deleteSecret(ref2);
      expect(await storage.getSecret(ref1)).toBe(null);
      expect(await storage.getSecret(ref2)).toBe(null);
      expect(await storage.hasSecret(ref1)).toBe(false);
      expect(await storage.hasSecret(ref2)).toBe(false);
    });
  });

  it("Should save read and delete values with caches cleared", async () => {
    const storage: ISecureStorage = new KeychainSecureStorage(true);
    jest.useFakeTimers();

    const value1 = "value1";
    const value2 = "value2";

    const ref1 = await storage.setSecret(value1);
    const ref2 = await storage.setSecret(value2);
    // time out all caches
    jest.runAllTimers();

    // values should be stored
    expect(await storage.getSecret(ref1)).toBe(value1);
    expect(await storage.getSecret(ref2)).toBe(value2);
    expect(await storage.hasSecret(ref1)).toBe(true);
    expect(await storage.hasSecret(ref2)).toBe(true);

    // delete one value
    await storage.deleteSecret(ref1);
    // time out all caches
    jest.runAllTimers();

    expect(await storage.getSecret(ref1)).toBe(null);
    expect(await storage.getSecret(ref2)).toBe(value2);
    expect(await storage.hasSecret(ref1)).toBe(false);
    expect(await storage.hasSecret(ref2)).toBe(true);

    // delete another value
    await storage.deleteSecret(ref2);
    // time out all caches
    jest.runAllTimers();

    expect(await storage.getSecret(ref1)).toBe(null);
    expect(await storage.getSecret(ref2)).toBe(null);
    expect(await storage.hasSecret(ref1)).toBe(false);
    expect(await storage.hasSecret(ref2)).toBe(false);
  });
});
