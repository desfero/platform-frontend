import { createMock } from "@neufund/shared-utils/tests";
import { expect } from "chai";
import fetchMock from "fetch-mock";

import { ISingleKeyStorage, JsonHttpClient } from "../../../core/module";
import { AuthJsonHttpClient } from "./AuthJsonHttpClient";

const TOKEN = "1234ABCD";

class DummyStorage implements ISingleKeyStorage<string> {
  async clear(): Promise<void> {}
  async get(): Promise<string | undefined> {
    return "foo";
  }
  async set(): Promise<void> {}
}

describe("AuthHttpClient", () => {
  afterEach(() => {
    expect(fetchMock.done()).to.be.true;
    fetchMock.restore();
  });

  it(`Should insert correct authorization header on requests`, async () => {
    const jwtStorage: ISingleKeyStorage<string> = createMock(DummyStorage, {
      get: async () => TOKEN,
    });

    const backendRootUrlMock = "";

    const httpClient = new JsonHttpClient(backendRootUrlMock);

    let receivedHeaders: any;

    const requestMatcher: fetchMock.MockMatcherFunction = (_url, opts) => {
      if (opts.method !== "GET") return false;
      receivedHeaders = opts.headers;
      return true;
    };

    fetchMock.once(requestMatcher, {});

    const authClient = new AuthJsonHttpClient(jwtStorage, httpClient);

    await authClient.get<{}>({
      baseUrl: "/",
      url: "some_url",
    });

    expect(receivedHeaders["Authorization"]).to.equal(`Bearer ${TOKEN}`);
  });
});
