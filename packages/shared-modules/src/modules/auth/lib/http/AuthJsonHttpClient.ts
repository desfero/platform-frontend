import { inject, injectable } from "inversify";

import { coreModuleApi, IHttpClient, ISingleKeyStorage } from "../../../core/module";
import { symbols } from "../symbols";
import { AuthHttpClient } from "./AuthHttpClient";

/**
 * Wraps the json http api with authorization header injection
 * collected from localstorage
 */
@injectable()
export class AuthJsonHttpClient extends AuthHttpClient {
  constructor(
    @inject(symbols.jwtStorage) protected jwtStorage: ISingleKeyStorage<string>,
    @inject(coreModuleApi.symbols.jsonHttpClient) protected httpClient: IHttpClient,
  ) {
    super();
  }
}
