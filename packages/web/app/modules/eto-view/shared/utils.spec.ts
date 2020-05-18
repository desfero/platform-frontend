import { EUserType } from "@neufund/shared-modules";
import { expect } from "chai";

import { EEtoState, ESocialChannelType } from "../../../lib/api/eto/EtoApi.interfaces.unsafe";
import {
  EJurisdiction,
  EOfferingDocumentType,
} from "../../../lib/api/eto/EtoProductsApi.interfaces";
import { TEtoWithCompanyAndContractReadonly } from "../../eto/types";
import {
  getTwitterData,
  getTwitterUrl,
  shouldShowInvestmentTerms,
  shouldShowProspectusDisclaimer,
  shouldShowTimeline,
} from "./utils";

const socialChannels = [
  {
    type: ESocialChannelType.FACEBOOK,
    url: "bla",
  },
  {
    type: ESocialChannelType.LINKEDIN,
    url: "blabla",
  },
];

const twitter = {
  type: ESocialChannelType.TWITTER,
  url: "twitter_url",
};

describe("eto view utils", () => {
  it("getTwitterUrl: socialChannels is undefined", () => {
    expect(getTwitterUrl(undefined)).to.be.undefined;
  });
  it("getTwitterUrl: socialChannels includes twitter", () => {
    expect(getTwitterUrl([...socialChannels, twitter])).to.eq("twitter_url");
  });
  it("getTwitterUrl: socialChannels doesn't include twitter", () => {
    expect(getTwitterUrl([...socialChannels])).to.be.undefined;
  });

  it("getTwitterData: socialChannels doesn't include twitter", () => {
    const companyData = {
      companyVideo: undefined,
      companySlideshare: undefined,
      companyPitchdeckUrl: undefined,
      companyNews: undefined,
      marketingLinks: undefined,
      socialChannels: [...socialChannels],
      disableTwitterFeed: false,
    };

    expect(getTwitterData(companyData)).to.deep.eq({ showTwitterFeed: false });
  });
  it("getTwitterData: socialChannels include twitter, twitter feed disabled", () => {
    const companyData = {
      companyVideo: undefined,
      companySlideshare: undefined,
      companyPitchdeckUrl: undefined,
      companyNews: undefined,
      marketingLinks: undefined,
      socialChannels: [...socialChannels, twitter],
      disableTwitterFeed: true,
    };

    expect(getTwitterData(companyData)).to.deep.eq({ showTwitterFeed: false });
  });
  it("shouldShowInvestmentTerms", () => {
    expect(
      shouldShowInvestmentTerms(
        {
          state: EEtoState.ON_CHAIN,
        } as TEtoWithCompanyAndContractReadonly,
        EUserType.INVESTOR,
      ),
    ).to.deep.eq(true);
    expect(
      shouldShowInvestmentTerms(
        {
          state: EEtoState.PREVIEW,
        } as TEtoWithCompanyAndContractReadonly,
        EUserType.INVESTOR,
      ),
    ).to.deep.eq(false);
    expect(
      shouldShowInvestmentTerms(
        {
          state: EEtoState.ON_CHAIN,
        } as TEtoWithCompanyAndContractReadonly,
        EUserType.ISSUER,
      ),
    ).to.deep.eq(true);
  });
  it("shouldShowTimeline", () => {
    expect(
      shouldShowTimeline({
        state: EEtoState.ON_CHAIN,
      } as TEtoWithCompanyAndContractReadonly),
    ).to.deep.eq(true);
    expect(
      shouldShowTimeline({
        state: EEtoState.PENDING,
      } as TEtoWithCompanyAndContractReadonly),
    ).to.deep.eq(false);
    expect(
      shouldShowTimeline({
        state: EEtoState.PREVIEW,
      } as TEtoWithCompanyAndContractReadonly),
    ).to.deep.eq(false);
  });
  it("shouldShowProspectusDisclaimer", () => {
    expect(
      shouldShowProspectusDisclaimer({
        product: {
          jurisdiction: EJurisdiction.GERMANY,
          offeringDocumentType: EOfferingDocumentType.PROSPECTUS,
        },
        state: EEtoState.PREVIEW,
      } as TEtoWithCompanyAndContractReadonly),
    ).to.be.equal(true);
    expect(
      shouldShowProspectusDisclaimer({
        product: {
          jurisdiction: EJurisdiction.GERMANY,
          offeringDocumentType: EOfferingDocumentType.MEMORANDUM,
        },
        state: EEtoState.ON_CHAIN,
      } as TEtoWithCompanyAndContractReadonly),
    ).to.be.equal(false);
    expect(
      shouldShowProspectusDisclaimer({
        product: {
          jurisdiction: EJurisdiction.GERMANY,
          offeringDocumentType: EOfferingDocumentType.MEMORANDUM,
        },
        state: EEtoState.PREVIEW,
      } as TEtoWithCompanyAndContractReadonly),
    ).to.be.equal(true);
    expect(
      shouldShowProspectusDisclaimer({
        product: {
          jurisdiction: EJurisdiction.GERMANY,
          offeringDocumentType: EOfferingDocumentType.PROSPECTUS,
        },
        state: EEtoState.LISTED,
      } as TEtoWithCompanyAndContractReadonly),
    ).to.be.equal(true);
  });
});
