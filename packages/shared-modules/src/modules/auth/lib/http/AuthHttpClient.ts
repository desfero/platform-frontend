import { injectable } from "inversify";

import {
  IHttpClient,
  IHttpGetRequest,
  IHttpPostRequest,
  IHttpRequestCommon,
  IHttpResponse,
  ISingleKeyStorage,
} from "../../../core/module";

export interface IAuthHttpClient extends IHttpClient {
  get<T>(config: IHttpGetRequest, jwt?: string): Promise<IHttpResponse<T>>;
}

/**
 * An Abstract class that wraps the general http api `httpClient` and adds authorization header injection
 *
 * @param jwt - This is an optional jwt that should be used only on rare occasions when the JWT doesn't exist
 * in the local storage (When the user is not logged in). This should be used with caution
 *
 * @note in the `IAuthHttpClient` interface only `get` method has the jwt optional typing. In order to limit the
 * use of passing JWT as props directly
 */
@injectable()
export abstract class AuthHttpClient implements IAuthHttpClient {
  protected abstract httpClient: IHttpClient;
  protected abstract jwtStorage: ISingleKeyStorage<string>;

  private async insertAuthHeader<T extends IHttpRequestCommon>(
    config: T,
    jwt?: string,
  ): Promise<T> {
    const jwtFromStorage = await this.jwtStorage.get();

    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${jwt || jwtFromStorage}`,
        /*
         * Additional custom header required due authorization issues on iOS12/Safari
         * https://github.com/Neufund/platform-frontend/issues/2425
         */
        "X-NF-Authorization": `Bearer ${jwt || jwtFromStorage}`,
      },
    };
  }

  public async get<T>(config: IHttpGetRequest, jwt?: string): Promise<IHttpResponse<T>> {
    return this.httpClient.get<T>(await this.insertAuthHeader(config, jwt));
  }

  public async post<T>(config: IHttpPostRequest): Promise<IHttpResponse<T>> {
    return this.httpClient.post<T>(await this.insertAuthHeader(config));
  }

  public async put<T>(config: IHttpPostRequest): Promise<IHttpResponse<T>> {
    return this.httpClient.put<T>(await this.insertAuthHeader(config));
  }

  public async patch<T>(config: IHttpPostRequest): Promise<IHttpResponse<T>> {
    return this.httpClient.patch<T>(await this.insertAuthHeader(config));
  }

  public async delete(config: IHttpPostRequest): Promise<IHttpResponse<any>> {
    return this.httpClient.delete(await this.insertAuthHeader(config));
  }
}
