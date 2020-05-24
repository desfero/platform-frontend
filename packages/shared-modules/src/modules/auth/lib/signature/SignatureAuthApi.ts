import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import { inject, injectable } from "inversify";
import * as Yup from "yup";

import { coreModuleApi, ESignerType, IHttpClient, IHttpResponse } from "../../../core/module";
import { EJwtPermissions } from "../../jwt/types";
import { symbols } from "../symbols";

export interface IChallengeEndpointResponse {
  challenge: string;
}

export interface ICreateJwtEndpointResponse {
  jwt: string;
}

const SIGNATURE_BASE_PATH = "/api/signature/";
const CREATE_JWT_PATH = "/jwt/create";
const GENERATE_CHALLENGE_PATH = "/jwt/challenge";
const REFRESH_JWT_PATH = "/jwt/refresh";

@injectable()
export class SignatureAuthApi {
  constructor(
    @inject(coreModuleApi.symbols.jsonHttpClient) private httpClient: IHttpClient,
    @inject(symbols.authJsonHttpClient) private authorizedHttpClient: IHttpClient,
  ) {}

  public async challenge(
    address: EthereumAddressWithChecksum,
    salt: string,
    signerType: ESignerType,
    permissions: EJwtPermissions[] = [],
  ): Promise<IHttpResponse<IChallengeEndpointResponse>> {
    return await this.httpClient.post<IChallengeEndpointResponse>({
      baseUrl: SIGNATURE_BASE_PATH,
      url: GENERATE_CHALLENGE_PATH,
      responseSchema: Yup.object().shape({
        challenge: Yup.string().required(),
      }),
      body: {
        address,
        salt,
        signer_type: signerType,
        permissions,
      },
    });
  }

  public createJwt(
    challenge: string,
    signedChallenge: string,
    signerType: ESignerType,
  ): Promise<ICreateJwtEndpointResponse> {
    return this.httpClient
      .post<ICreateJwtEndpointResponse>({
        baseUrl: SIGNATURE_BASE_PATH,
        url: CREATE_JWT_PATH,
        responseSchema: Yup.object().shape({
          jwt: Yup.string().required(),
        }),
        body: {
          challenge,
          response: signedChallenge,
          signer_type: signerType,
        },
      })
      .then(r => r.body);
  }

  public escalateJwt(
    challenge: string,
    signedChallenge: string,
    signerType: ESignerType,
  ): Promise<ICreateJwtEndpointResponse> {
    return this.authorizedHttpClient
      .post<ICreateJwtEndpointResponse>({
        baseUrl: SIGNATURE_BASE_PATH,
        url: CREATE_JWT_PATH,
        responseSchema: Yup.object().shape({
          jwt: Yup.string().required(),
        }),
        body: {
          challenge,
          response: signedChallenge,
          signer_type: signerType,
        },
      })
      .then(r => r.body);
  }

  public refreshJwt(): Promise<ICreateJwtEndpointResponse> {
    return this.authorizedHttpClient
      .post<ICreateJwtEndpointResponse>({
        baseUrl: SIGNATURE_BASE_PATH,
        url: REFRESH_JWT_PATH,
        responseSchema: Yup.object().shape({
          jwt: Yup.string().required(),
        }),
      })
      .then(r => r.body);
  }
}
