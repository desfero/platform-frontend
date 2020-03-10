/**
 * Wraps the general http api with authorization header injection
 * collected from localstorage
 */
import { injectable } from "inversify";

import { ObjectStorage } from "../../persistence/ObjectStorage";
import {
  IHttpClient,
  IHttpGetRequest,
  IHttpPostRequest,
  IHttpRequestCommon,
  IHttpResponse,
} from "./IHttpClient";

export interface IAuthHttpClient extends IHttpClient {
  get<T>(config: IHttpGetRequest, jwt?: string): Promise<IHttpResponse<T>>;
}

@injectable()
export abstract class AuthorizedHttpClient implements IAuthHttpClient {
  protected abstract httpClient: IHttpClient;
  protected abstract objectStorage: ObjectStorage<string>;

  private insertAuthHeader<T extends IHttpRequestCommon>(config: any, jwt?: string): T {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${jwt || this.objectStorage.get()}`,
        /*
         * Additional custom header required due authorization issues on iOS12/Safari
         * https://github.com/Neufund/platform-frontend/issues/2425
         */
        "X-NF-Authorization": `Bearer ${jwt || this.objectStorage.get()}`,
      },
    };
  }

  public async get<T>(config: IHttpGetRequest, jwt?: string): Promise<IHttpResponse<T>> {
    return this.httpClient.get<T>(this.insertAuthHeader(config, jwt));
  }

  public async post<T>(config: IHttpPostRequest): Promise<IHttpResponse<T>> {
    return this.httpClient.post<T>(this.insertAuthHeader(config));
  }

  public async put<T>(config: IHttpPostRequest): Promise<IHttpResponse<T>> {
    return this.httpClient.put<T>(this.insertAuthHeader(config));
  }

  public async patch<T>(config: IHttpPostRequest): Promise<IHttpResponse<T>> {
    return this.httpClient.patch<T>(this.insertAuthHeader(config));
  }

  public async delete(config: IHttpPostRequest): Promise<IHttpResponse<any>> {
    return this.httpClient.delete(this.insertAuthHeader(config));
  }
}
