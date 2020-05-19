import { authModuleAPI, IHttpClient } from "@neufund/shared-modules";
import { inject, injectable } from "inversify";

import { TEtoDocumentTemplates } from "./EtoFileApi.interfaces";
import { TEtoProducts } from "./EtoProductsApi.interfaces";

const BASE_PATH = "/api/eto-listing/";
const PRODUCTS_PATH = "/products";
const ETO_PRODUCT_PATH = "/etos/me/product";
const ETO_PRODUCT_TEMPLATES_PATH = "templates";

@injectable()
export class EtoProductApi {
  constructor(
    @inject(authModuleAPI.symbols.authJsonHttpClient) private authorizedHttpClient: IHttpClient,
  ) {}

  public async getProducts(): Promise<TEtoProducts> {
    const productsResponse = await this.authorizedHttpClient.get<TEtoProducts>({
      baseUrl: BASE_PATH,
      url: PRODUCTS_PATH,
    });

    return productsResponse.body;
  }

  public async changeProductType(productId: string): Promise<TEtoProducts> {
    const productsResponse = await this.authorizedHttpClient.put<TEtoProducts>({
      baseUrl: BASE_PATH,
      url: ETO_PRODUCT_PATH,
      body: {
        productId,
      },
    });

    return productsResponse.body;
  }

  public async getProductTemplates(productId: string): Promise<TEtoDocumentTemplates> {
    const response = await this.authorizedHttpClient.get<TEtoDocumentTemplates>({
      baseUrl: BASE_PATH,
      url: `${PRODUCTS_PATH}/${productId}/${ETO_PRODUCT_TEMPLATES_PATH}`,
    });

    return response.body;
  }
}
