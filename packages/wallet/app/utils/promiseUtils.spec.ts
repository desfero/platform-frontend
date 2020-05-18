import { unwrapPromise } from "./promiseUtils";

describe("promise utils", () => {
  describe("unwrapPromise", () => {
    it("should handle properly resolving", async () => {
      const { resolve, promise } = unwrapPromise<string>();

      const value = "foo";

      setTimeout(() => resolve(value), 1);

      const result = await promise;

      expect(result).toBe(value);
    });

    it("should handle properly rejecting", async () => {
      const { reject, promise } = unwrapPromise<string>();

      const customError = new Error();

      setTimeout(() => reject(customError), 1);

      try {
        await promise;
      } catch (e) {
        expect(e).toBe(customError);
      }
    });
  });
});
