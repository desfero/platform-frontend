import { authModuleAPI, coreModuleApi, IHttpClient, IHttpResponse } from "@neufund/shared-modules";
import { Dictionary, EthereumAddress, withParams } from "@neufund/shared-utils";
import { inject, injectable } from "inversify";
import { toChecksumAddress } from "web3-utils";

import { amendEtoToCompatibleFormat } from "../../../utils";
import {
  TBookBuildingsStatsList,
  TEtoDataWithCompany,
  TPartialCompanyEtoData,
  TPartialEtoSpecData,
} from "./EtoApi.interfaces.unsafe";
import { IBookBuildingStats } from "./EtoPledgeApi.interfaces.unsafe";

const BASE_PATH = "/api/eto-listing/";
const COMPANIES_ME_DATA_PATH = "/companies/me";
const COMPANIES_DATA_PATH = "/companies/";
const ETOS_PATH = "/etos";
const ETO_DATA_PATH = "/etos/me";
const ETO_SUBMISSION_PATH = "/etos/me/submission";
const ETO_BOOK_BUILDING_PATH = "/etos/me/bookbuilding";
const ETO_PREVIEW_PATH = "/eto/view/:previewCode";
const ETO_PREVIEW_SUBMISSION_PATH = "/etos/me/preview-submission";
const NOMINEE_ETOS_PATH = "/nominees/me/etos";

@injectable()
export class EtoApi {
  constructor(
    @inject(authModuleAPI.symbols.authJsonHttpClient) private authorizedHttpClient: IHttpClient,
    @inject(coreModuleApi.symbols.jsonHttpClient) private httpClient: IHttpClient,
  ) {}

  public async getEtos(): Promise<TPartialEtoSpecData[]> {
    return await this.httpClient
      .get<TPartialEtoSpecData[]>({
        baseUrl: BASE_PATH,
        url: ETOS_PATH,
      })
      .then(r => r.body.map(eto => amendEtoToCompatibleFormat(eto)));
  }

  public getMyEto(): Promise<TPartialEtoSpecData> {
    return this.authorizedHttpClient
      .get<TPartialEtoSpecData>({
        baseUrl: BASE_PATH,
        url: ETO_DATA_PATH,
      })
      .then(r => amendEtoToCompatibleFormat(r.body));
  }

  public async getEto(etoId: string): Promise<TPartialEtoSpecData> {
    return await this.httpClient
      .get<TPartialEtoSpecData>({
        baseUrl: BASE_PATH,
        url: ETOS_PATH + "/" + etoId,
      })
      .then(r => amendEtoToCompatibleFormat(r.body));
  }

  public async putMyEto(data: TPartialEtoSpecData): Promise<IHttpResponse<TPartialEtoSpecData>> {
    return await this.authorizedHttpClient.put<TPartialEtoSpecData>({
      baseUrl: BASE_PATH,
      url: ETO_DATA_PATH,
      body: data,
    });
  }

  public async patchMyEto(data: TPartialEtoSpecData): Promise<IHttpResponse<TPartialEtoSpecData>> {
    return this.authorizedHttpClient.patch<TPartialEtoSpecData>({
      baseUrl: BASE_PATH,
      url: ETO_DATA_PATH,
      body: data,
    });
  }

  public async getEtoPreview(previewCode: string): Promise<TPartialCompanyEtoData> {
    return await this.httpClient
      .get<TPartialCompanyEtoData>({
        baseUrl: BASE_PATH,
        url: withParams(ETO_PREVIEW_PATH, { previewCode }),
      })
      .then(r => r.body);
  }

  public getCompany(): Promise<TPartialCompanyEtoData> {
    return this.authorizedHttpClient
      .get<TPartialCompanyEtoData>({
        baseUrl: BASE_PATH,
        url: COMPANIES_ME_DATA_PATH,
      })
      .then(r => r.body);
  }

  public getCompanyById(companyId: string): Promise<TPartialCompanyEtoData> {
    return this.httpClient
      .get<TPartialCompanyEtoData>({
        baseUrl: BASE_PATH,
        url: COMPANIES_DATA_PATH + companyId,
      })
      .then(r => r.body);
  }

  public async putCompany(
    data: TPartialCompanyEtoData,
  ): Promise<IHttpResponse<TPartialCompanyEtoData>> {
    return await this.authorizedHttpClient.put<TPartialCompanyEtoData>({
      baseUrl: BASE_PATH,
      url: COMPANIES_ME_DATA_PATH,
      body: data,
    });
  }

  public async patchCompany(
    data: TPartialCompanyEtoData,
  ): Promise<IHttpResponse<TPartialCompanyEtoData>> {
    return this.authorizedHttpClient.patch<TPartialCompanyEtoData>({
      baseUrl: BASE_PATH,
      url: COMPANIES_ME_DATA_PATH,
      body: data,
    });
  }

  public async submitCompanyAndEto(): Promise<IHttpResponse<TEtoDataWithCompany>> {
    return await this.authorizedHttpClient.post<TEtoDataWithCompany>({
      baseUrl: BASE_PATH,
      url: ETO_SUBMISSION_PATH,
    });
  }

  public async publishCompanyAndEto(): Promise<IHttpResponse<TEtoDataWithCompany>> {
    return await this.authorizedHttpClient.post<TEtoDataWithCompany>({
      baseUrl: BASE_PATH,
      url: ETO_PREVIEW_SUBMISSION_PATH,
    });
  }

  public async changeBookBuildingState(
    isBookBuilding: boolean,
  ): Promise<IHttpResponse<TEtoDataWithCompany>> {
    return await this.authorizedHttpClient.put<TEtoDataWithCompany>({
      baseUrl: BASE_PATH,
      url: ETO_BOOK_BUILDING_PATH,
      body: { is_bookbuilding: isBookBuilding },
    });
  }

  public getBookBuildingStats(etoId: string): Promise<IHttpResponse<any>> {
    return this.httpClient.get<any>({
      baseUrl: BASE_PATH,
      url: ETOS_PATH + "/" + etoId + "/bookbuilding-stats",
    });
  }

  public getBookBuildingStatsList(etosIds: string[]): Promise<Dictionary<IBookBuildingStats>> {
    return this.httpClient
      .get<TBookBuildingsStatsList>({
        baseUrl: BASE_PATH,
        url: `/bookbuilding-stats?eto_ids=${etosIds}`,
      })
      .then(response => {
        const etosStatsResponse: Dictionary<IBookBuildingStats> = response.body.bookbuildingStats;
        const etoStats: any = {};
        for (let key in etosStatsResponse) {
          etoStats[toChecksumAddress(key as EthereumAddress)] = etosStatsResponse[key];
        }
        return etoStats;
      });
  }

  public getDetailedBookBuildingStats(): Promise<IHttpResponse<any>> {
    return this.authorizedHttpClient.get<any>({
      baseUrl: BASE_PATH,
      url: ETOS_PATH + "/me/pledges",
    });
  }

  public async loadNomineeEtos(): Promise<TEtoDataWithCompany[]> {
    const response = await this.authorizedHttpClient.get<TEtoDataWithCompany[]>({
      baseUrl: BASE_PATH,
      url: NOMINEE_ETOS_PATH,
    });

    return response.body;
  }
}
