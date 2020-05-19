import { createActionFactory, Dictionary } from "@neufund/shared-utils";

import { TCompanyEtoData, TEtoSpecsData } from "./lib/http/eto-api/EtoApi.interfaces.unsafe";
import { EEtoDocumentType, IEtoDocument } from "./lib/http/eto-api/EtoFileApi.interfaces";
import {
  IEtoTokenData,
  IEtoTokenGeneralDiscounts,
  SignedISHAStatus,
  TEtoContractData,
  TEtoWithCompanyAndContractReadonly,
  TOfferingAgreementsStatus,
} from "./types";

export const etoActions = {
  // public actions
  loadEtoPreview: createActionFactory(
    "ETO_LOAD_ETO_PREVIEW",
    (previewCode: string, widgetView?: boolean) => ({
      previewCode,
      widgetView,
    }),
  ),
  loadEto: createActionFactory("ETO_LOAD_ETO", (etoId: string, widgetView?: boolean) => ({
    etoId,
    widgetView,
  })),
  loadEtos: createActionFactory("ETO_LOAD_ETOS"),
  loadTokenTerms: createActionFactory(
    "INVESTOR_TOKEN_PRICE_LOAD",
    (eto: TEtoWithCompanyAndContractReadonly) => ({ eto }),
  ),
  downloadEtoDocument: createActionFactory(
    "ETO_DOWNLOAD_DOCUMENT",
    (document: IEtoDocument, eto: TEtoWithCompanyAndContractReadonly) => ({
      document,
      eto,
    }),
  ),
  downloadEtoTemplateByType: createActionFactory(
    "ETO_DOWNLOAD_TEMPLATE_BY_TYPE",
    (etoId: string, documentType: EEtoDocumentType) => ({ etoId, documentType }),
  ),
  loadEtoAgreementsStatus: createActionFactory(
    "ETO_LOAD_AGREEMENTS_STATUS",
    (eto: TEtoWithCompanyAndContractReadonly) => ({
      eto,
    }),
  ),
  confirmJurisdictionDisclaimer: createActionFactory("ETO_CONFIRM_JURISDICTION_DISCLAIMER"),
  confirmConfidentialityAgreement: createActionFactory("ETO_CONFIRM_CONFIDENTIALITY_AGREEMENT"),

  // state mutations
  setEtos: createActionFactory(
    "ETO_SET_ETOS",
    ({
      etos,
      companies,
    }: {
      etos: Dictionary<TEtoSpecsData>;
      companies: Dictionary<TCompanyEtoData>;
    }) => ({ etos, companies }),
  ),
  setEto: createActionFactory(
    "ETO_SET_ETO",
    ({ eto, company }: { eto: TEtoSpecsData; company?: TCompanyEtoData }) => ({
      eto,
      company,
    }),
  ),
  setEtosDisplayOrder: createActionFactory("ETO_SET_DISPLAY_ORDER", (order: string[]) => ({
    order,
  })),
  setEtoDataFromContract: createActionFactory(
    "ETO_SET_ETO_DATA_FROM_CONTRACT",
    (previewCode: string, data: TEtoContractData) => ({ previewCode, data }),
  ),
  setEtoWidgetError: createActionFactory("ETO_SET_ETO_WIDGET_ERROR"),
  setTokenData: createActionFactory(
    "ETO_SET_ETO_TOKEN_DATA",
    (previewCode: string, tokenData: IEtoTokenData) => ({
      previewCode,
      tokenData,
    }),
  ),
  setTokenGeneralDiscounts: createActionFactory(
    "ETO_SET_ETO_TOKEN_GENERAL_DISCOUNTS",
    (etoId: string, tokenGeneralDiscounts: IEtoTokenGeneralDiscounts) => ({
      etoId,
      tokenGeneralDiscounts,
    }),
  ),
  setAgreementsStatus: createActionFactory(
    "ETO_SET_AGREEMENTS_STATUS",
    (previewCode: string, statuses: TOfferingAgreementsStatus) => ({
      previewCode,
      statuses,
    }),
  ),
  loadSignedInvestmentAgreement: createActionFactory(
    "ETO_LOAD_INVESTMENT_AGREEMENT",
    (etoId: string, previewCode: string) => ({ etoId, previewCode }),
  ),
  setInvestmentAgreementHash: createActionFactory(
    "ETO_SET_INVESTMENT_AGREEMENT_URL",
    (previewCode: string, url: SignedISHAStatus["url"]) => ({ url, previewCode }),
  ),
  loadCapitalIncrease: createActionFactory(
    "ETO_LOAD_CAPITAL_INCREASE",
    (etoId: string, previewCode: string) => ({ etoId, previewCode }),
  ),
  setEtosError: createActionFactory("ETO_SET_ETOS_ERROR"),
  setTokensLoadingDone: createActionFactory("ETO_TOKENS_LOADING_DONE"),
};
