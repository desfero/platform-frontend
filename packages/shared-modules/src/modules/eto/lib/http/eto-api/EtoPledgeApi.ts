import { authModuleAPI, IHttpClient, IHttpResponse } from "@neufund/shared-modules";
import { withParams } from "@neufund/shared-utils";
import { inject, injectable } from "inversify";

import { IPledge, IPledges } from "./EtoPledgeApi.interfaces.unsafe";

const BASE_PATH = "/api/eto-listing/";
const MY_PLEDGE_PATH = "/etos/:etoId/pledges/me";
const ALL_MY_PLEDGES_PATH = "/pledges/me";

export class EtoPledgeApiError extends Error {}
export class EtoPledgeNotFound extends EtoPledgeApiError {}
export class EtoPledgesNotFound extends EtoPledgeApiError {}

const myPledgePathLink = (etoId: string) => withParams(MY_PLEDGE_PATH, { etoId });

@injectable()
export class EtoPledgeApi {
  constructor(
    @inject(authModuleAPI.symbols.authJsonHttpClient) private authorizedHttpClient: IHttpClient,
  ) {}

  public async getPledgeForEto(etoId: string): Promise<IHttpResponse<IPledge>> {
    const response = await this.authorizedHttpClient.get<IPledge>({
      baseUrl: BASE_PATH,
      url: myPledgePathLink(etoId),
      allowedStatusCodes: [404],
    });

    if (response.statusCode === 404) {
      throw new EtoPledgeNotFound();
    }

    return response;
  }

  public async getAllMyPledges(): Promise<IPledges> {
    const response = await this.authorizedHttpClient.get<IPledge[]>({
      baseUrl: BASE_PATH,
      url: ALL_MY_PLEDGES_PATH,
      allowedStatusCodes: [404],
    });

    if (response.statusCode === 404) {
      throw new EtoPledgesNotFound();
    }

    const pledges: IPledges = {};
    response.body.forEach((item: IPledge) => {
      pledges[item.etoId!] = item;
    });

    return pledges;
  }

  public saveMyPledge(etoId: string, pledge: IPledge): Promise<IHttpResponse<IPledge>> {
    return this.authorizedHttpClient.put<IPledge>({
      baseUrl: BASE_PATH,
      url: myPledgePathLink(etoId),
      body: pledge,
    });
  }

  public deleteMyPledge(etoId: string): Promise<IHttpResponse<IPledge>> {
    return this.authorizedHttpClient.delete<IPledge>({
      baseUrl: BASE_PATH,
      url: myPledgePathLink(etoId),
    });
  }
}
