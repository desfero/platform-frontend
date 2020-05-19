import { authModuleAPI, IHttpClient } from "@neufund/shared-modules";
import { withParams } from "@neufund/shared-utils";
import { inject, injectable } from "inversify";
import { Dictionary } from "lodash";

import { EEtoDocumentType, IEtoDocument, TStateInfo } from "./EtoFileApi.interfaces";

const BASE_PATH = "/api/eto-listing/etos";
// Issuer endpoints
const ETO_DOCUMENTS_PATH = "/me/documents";
const ETO_DOCUMENTS_INFO_PATH = "/me/documents/state_info";
const ETO_TEMPLATES_PATH = "/me/templates";
// Public ETO endpoints
const ETO_BY_ID_TEMPLATES_PATH = "/:etoId/templates/:documentType";

export class EtoFileApiError extends Error {}
export class FileAlreadyExists extends EtoFileApiError {}

@injectable()
export class EtoFileApi {
  constructor(@inject(authModuleAPI.symbols.authJsonHttpClient) private httpClient: IHttpClient) {}

  public async uploadEtoDocument(
    file: File,
    documentType: EEtoDocumentType,
  ): Promise<IEtoDocument> {
    const data = new FormData();
    data.append("file", file);
    data.append(
      "document_data",
      JSON.stringify({
        mime_type: "application/pdf",
        document_type: documentType,
        name: file.name,
        form: "document",
      }),
    );
    const response = await this.httpClient.post<IEtoDocument>({
      baseUrl: BASE_PATH,
      url: ETO_DOCUMENTS_PATH,
      formData: data,
      allowedStatusCodes: [409],
    });
    if (response.statusCode === 409) {
      throw new FileAlreadyExists();
    }

    return response.body;
  }

  public async deleteSpecificEtoDocument(ipfsHash: string): Promise<string> {
    const response = await this.httpClient.delete<string>({
      baseUrl: BASE_PATH,
      url: `${ETO_DOCUMENTS_PATH}/${ipfsHash}`,
    });

    return response.body;
  }

  public async getEtoFileStateInfo(): Promise<TStateInfo> {
    const response = await this.httpClient.get<TStateInfo>({
      baseUrl: BASE_PATH,
      url: ETO_DOCUMENTS_INFO_PATH,
    });

    return response.body;
  }

  public async getEtoTemplate(
    etoDocument: IEtoDocument,
    inputs: Dictionary<string>,
  ): Promise<IEtoDocument> {
    const response = await this.httpClient.get<IEtoDocument>({
      baseUrl: BASE_PATH,
      url: `${ETO_TEMPLATES_PATH}/${etoDocument.documentType}`,
      queryParams: {
        inputs: JSON.stringify(inputs),
      },
      skipResponseParsing: true,
    });

    return response.body;
  }

  public async getSpecificEtoTemplate(
    etoId: string,
    etoDocument: IEtoDocument,
    inputs: Dictionary<string>,
  ): Promise<IEtoDocument> {
    const response = await this.httpClient.get<IEtoDocument>({
      baseUrl: BASE_PATH,
      url: withParams(ETO_BY_ID_TEMPLATES_PATH, { etoId, documentType: etoDocument.documentType }),
      queryParams: {
        inputs: JSON.stringify(inputs),
      },
      skipResponseParsing: true,
    });

    return response.body;
  }
}
