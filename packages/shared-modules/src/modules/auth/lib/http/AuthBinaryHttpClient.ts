import { inject, injectable } from "inversify";

import { coreModuleApi, IHttpClient, ISingleKeyStorage } from "../../../core/module";
import { symbols } from "../symbols";
import { AuthHttpClient } from "./AuthHttpClient";

/**
 * Wraps the binary http api with authorization header injection
 * collected from provided storage
 */
@injectable()
export class AuthBinaryHttpClient extends AuthHttpClient {
  constructor(
    @inject(symbols.jwtStorage) protected jwtStorage: ISingleKeyStorage<string>,
    @inject(coreModuleApi.symbols.binaryHttpClient) protected httpClient: IHttpClient,
  ) {
    super();
  }
}
