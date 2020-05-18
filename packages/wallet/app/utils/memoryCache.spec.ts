import { Cache } from "./memoryCache";

describe("Memory cache", () => {
  it("Should cache keys", async () => {
    const reference = "reference";
    const value = "value";
    const cache = new Cache();
    cache.put(reference, value, 1000);
    expect(cache.get(reference)).toBe(value);
  });

  it("Should isolate cache instances", async () => {
    const reference = "reference";
    const value = "value";
    const cache1 = new Cache();
    const cache2 = new Cache();
    cache1.put(reference, value, 1000);
    expect(cache1.get(reference)).toBe(value);
    expect(cache2.get(reference)).toBe(null);
  });

  it("Should forget cached values after timeout", async () => {
    jest.useFakeTimers();

    const reference = "reference";
    const value = "value";
    const cache = new Cache();
    cache.put(reference, value, 1000);
    // running the timer should clear the cache
    jest.runAllTimers();
    expect(cache.get(reference)).toBe(null);
  });
});
