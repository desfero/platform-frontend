import { EUserType } from "@neufund/shared-modules";
import { XOR } from "@neufund/shared-utils";

import {
  EEtoState,
  ESocialChannelType,
  TCompanyEtoData,
  TEtoMediaData,
  TSocialChannelsType,
  TSocialChannelType,
} from "../../../lib/api/eto/EtoApi.interfaces.unsafe";
import {
  EJurisdiction,
  EOfferingDocumentType,
} from "../../../lib/api/eto/EtoProductsApi.interfaces";
import { TEtoWithCompanyAndContractReadonly } from "../../eto/types";

export const getTwitterUrl = (socialChannels: TSocialChannelsType | undefined) => {
  if (!socialChannels) {
    return undefined;
  } else {
    const twitterData = socialChannels.find(
      (c: TSocialChannelType) => c.type === ESocialChannelType.TWITTER,
    );
    return twitterData && twitterData.url;
  }
};

export const getTwitterData = (
  companyData: TEtoMediaData,
): XOR<{ showTwitterFeed: true; twitterUrl: string }, { showTwitterFeed: false }> => {
  const twitterUrl = getTwitterUrl(companyData.socialChannels);

  return !!twitterUrl && !companyData.disableTwitterFeed
    ? { showTwitterFeed: true, twitterUrl }
    : { showTwitterFeed: false };
};

export const shouldShowYouTube = (companyData: TCompanyEtoData) => !!companyData.companyVideo?.url;

export const shouldShowSlideshare = (companyData: TCompanyEtoData) =>
  !!companyData.companySlideshare?.url;

export const shouldShowSocialChannels = (companyData: TCompanyEtoData) =>
  !!companyData.socialChannels?.length;

export const shouldShowInvestmentTerms = (
  eto: TEtoWithCompanyAndContractReadonly,
  userType: EUserType | undefined,
) => ![EEtoState.PENDING, EEtoState.PREVIEW].includes(eto.state) || userType === EUserType.ISSUER;

export const shouldShowTimeline = (eto: TEtoWithCompanyAndContractReadonly) =>
  [EEtoState.LISTED, EEtoState.PROSPECTUS_APPROVED, EEtoState.ON_CHAIN].includes(eto.state);

export const shouldShowProspectusDisclaimer = (eto: TEtoWithCompanyAndContractReadonly) => {
  const isSupportedJurisdiction = [EJurisdiction.GERMANY, EJurisdiction.LIECHTENSTEIN].includes(
    eto.product.jurisdiction,
  );

  return (
    isSupportedJurisdiction &&
    ([EEtoState.PREVIEW, EEtoState.PENDING].includes(eto.state) ||
      eto.product.offeringDocumentType === EOfferingDocumentType.PROSPECTUS)
  );
};
