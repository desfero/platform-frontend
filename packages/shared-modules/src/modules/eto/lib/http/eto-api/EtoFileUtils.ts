// Templates to not be presented
import { EEtoDocumentType, IEtoDocument } from "./EtoFileApi.interfaces";

export const ignoredTemplates: string[] = ["pamphletTemplate", "prospectusTemplate"];

export const ignoredTemplatesPublicView: string[] = [
  ...ignoredTemplates,
  "termsheetTemplate",
  "investmentMemorandumTemplate",
  "investmentSummaryTemplate",
];

// Templates to not be presented to nominee
export const nomineeIgnoredTemplates: string[] = [
  "pamphletTemplate",
  "prospectusTemplate",
  "investmentMemorandumTemplate",
  "investmentAndShareholderAgreementTemplate",
  "termsheetTemplate",
  "investmentSummaryTemplate",
];

// Termsheet template was enabled
// @see https://github.com/Neufund/platform-frontend/issues/2744
// Documents to not be publicly presented
export const ignoredDocuments: EEtoDocumentType[] = [
  EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT,
];

export const canShowDocument = (document: IEtoDocument, isUserFullyVerified: boolean) => {
  if (ignoredDocuments.includes(document.documentType)) {
    return false;
  }

  // ISHA preview and SIGNED ISHA can only be shown when user is fully verified
  if (
    [
      EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT_PREVIEW,
      EEtoDocumentType.SIGNED_INVESTMENT_AND_SHAREHOLDER_AGREEMENT,
    ].includes(document.documentType)
  ) {
    return isUserFullyVerified;
  }

  return true;
};
