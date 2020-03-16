import {
  ECurrency,
  EthereumAddress,
  EthereumAddressWithChecksum,
  EthereumNetworkId,
  toEquityTokenSymbol,
} from "@neufund/shared";
import { createStore, Store } from "redux";

import { IConfig } from "../app/config/getConfig";
import {
  EEtoMarketingDataVisibleInPreview,
  EEtoState,
  EFundingRound,
  ESocialChannelType,
  ETagAlongVotingRule,
  TCompanyEtoData,
} from "../app/lib/api/eto/EtoApi.interfaces.unsafe";
import {
  EEtoDocumentLanguage,
  EEtoDocumentType,
  IEtoFilesInfo,
  TEtoDocumentTemplates,
  TEtoFormType,
} from "../app/lib/api/eto/EtoFileApi.interfaces";
import {
  EAssetType,
  EJurisdiction,
  EOfferingDocumentSubtype,
  EOfferingDocumentType,
  EProductName,
} from "../app/lib/api/eto/EtoProductsApi.interfaces";
import { EETOStateOnChain, TEtoWithCompanyAndContractReadonly } from "../app/modules/eto/types";

import companyBanner from "./assets/company-banner.png";
import companyPreviewCardBanner from "./assets/company-preview-banner.png";

export const dummyConfig: IConfig = {
  ethereumNetwork: {
    rpcUrl: "https://localhost:8080",
    backendRpcUrl: "https://localhost:8080",
  },
  contractsAddresses: {
    universeContractAddress: "UNIVERSE_ADDRESS",
  },
  externalResources: {
    etoStatisticsIframeURL: "https://test.icomonitor.io/#/eto-stats/:etoId",
  },
  backendRoot: {
    url: "",
  },
};

export const dummyNetworkId: EthereumNetworkId = "5" as EthereumNetworkId;

export function createDummyStore(): Store<any> {
  return createStore(() => {});
}

export const dummyEthereumAddress = "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359" as EthereumAddress;
export const dummyEthereumAddressWithChecksum = "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359" as EthereumAddressWithChecksum;

export const testCompany: TCompanyEtoData = {
  companyBanner,
  companyPreviewCardBanner,
  companyLegalDescription: "Est castus ionicis tormento, cesaris.",
  companyPitchdeckUrl: { title: "", url: "http://neufund.org" },
  companyStage: EFundingRound.A_ROUND,
  city: "Berlin",
  businessModel: undefined,
  companyMission: undefined,
  customerGroup: undefined,
  inspiration: undefined,
  keyBenefitsForInvestors: undefined,
  keyCompetitors: undefined,
  keyQuoteInvestor: undefined,
  marketTraction: undefined,
  impact: undefined,
  marketingApproach: undefined,
  problemSolved: undefined,
  riskBusinessModelDescription: undefined,
  riskLiquidityDescription: undefined,
  riskMaxDescription: undefined,
  riskThirdPartyDescription: undefined,
  riskThirdPartySharesFinancing: undefined,
  roadmap: undefined,
  targetMarketAndIndustry: undefined,
  useOfCapital: "all for nothing",
  advisors: {
    members: [
      {
        description:
          "André Eggert is a partner at LACORE. He advises companies and entrepreneurs as well as investors. One of his core activities is the support of M&A and financing transactions.",
        image:
          "https://documents.neufund.io/0x64Ee2B334454A920cE99f39Cc7557b428db8D5B8/9859a896-513d-42bd-a17b-2b020b7e5c1f.jpg",
        name: "André Eggert",
        role: "Legal Architect",
        website: "",
        socialChannels: [
          {
            type: ESocialChannelType.MEDIUM,
            url: "",
          },
          {
            type: ESocialChannelType.TWITTER,
            url: "",
          },
          {
            type: ESocialChannelType.LINKEDIN,
            url: "",
          },
        ],
      },
    ],
  },
  boardMembers: {
    members: [
      {
        description: "",
        image: "",
        name: "",
        role: "",
        website: "",
        socialChannels: [
          {
            type: ESocialChannelType.MEDIUM,
            url: "",
          },
          {
            type: ESocialChannelType.TWITTER,
            url: "",
          },
          {
            type: ESocialChannelType.LINKEDIN,
            url: "",
          },
        ],
      },
    ],
  },
  brandName: "Neufund",
  categories: ["Technology", "Blockchain", "Fintech"],
  companyDescription:
    "Blockchain based equity fundraising platform, ecosystem of smart contracts operating on the Ethereum blockchain. The Company’s key expertise lies in legal-tech and reg-tech. Neufund is a Blockchain protocol for securities’ tokenization and issuance.",
  companyId: "0xC8f867Cf4Ed30b4fF0Aa4c4c8c6b684397B219B0",
  companyLogo:
    "https://documents.neufund.io/0x64Ee2B334454A920cE99f39Cc7557b428db8D5B8/ccaf9ab7-fae1-41df-aa72-cf931abd5931.png",
  companyNews: [
    {
      publication: "Econotimes",
      title:
        "Neufund joins Malta Stock-Exchange and Binance to build blockchain-based exchange for equity tokens",
      url:
        "https://www.econotimes.com/Neufund-joins-Malta-Stock-Exchange-and-Binance-to-build-blockchain-based-exchange-for-equity-tokens-1405589",
    },
    {
      publication: "Neufund",
      title: "ETO with Neufund",
      url: "https://neufund.org/cms_resources/fundraising-process-with-neufund.pdf%C2%A0",
    },
  ],
  companyOneliner: "Equity Fundraising on Blockchain",
  companyShareCapital: 40859,
  shareCapitalCurrencyCode: "EUR",
  companySlideshare: {
    title: "",
    url: "",
  },
  companyVideo: {
    title: "",
    url: "https://www.youtube.com/watch?v=M0Hhl27TPR4",
  },
  disableTwitterFeed: true,
  companyWebsite: "https://neufund.org",
  country: "DE",
  foundingDate: "2016-08-18",
  //jurisdiction: "DE",
  keyAlliances: {
    members: [
      {
        description: "",
        image: "",
        name: "",
        role: "",
        website: "",
        socialChannels: [
          {
            type: ESocialChannelType.MEDIUM,
            url: "",
          },
          {
            type: ESocialChannelType.TWITTER,
            url: "",
          },
          {
            type: ESocialChannelType.LINKEDIN,
            url: "",
          },
        ],
      },
    ],
  },
  keyCustomers: {
    members: [
      {
        description: "",
        image: "",
        name: "",
        role: "",
        website: "",
        socialChannels: [
          {
            type: ESocialChannelType.MEDIUM,
            url: "",
          },
          {
            type: ESocialChannelType.TWITTER,
            url: "",
          },
          {
            type: ESocialChannelType.LINKEDIN,
            url: "",
          },
        ],
      },
    ],
  },
  lastFundingSizeEur: 8000000,
  keyQuoteFounder:
    "'Neufunds ETOs are changing the space by offering direct, transparent and, most importantly, legally binding investment rounds on the blockchain, which is an attractive proposition to both companies and investors. - Frank Thelen, Freigeist VC'",
  legalForm: "Company Legal Form",
  marketingLinks: [
    {
      title: "Pitch Deck",
      url:
        "https://docs.google.com/presentation/d/14mRlEDSNAMWybfgYFJUJyE8oEps0VJPIoaYfmmpZTmw/edit#slide=id.g3e534cab92_0_70",
    },
  ],
  name: "Company Name ISSUER_SIGNING",
  notableInvestors: {
    members: [
      {
        description:
          "Frank Thelen is a European serial founder, tech investor and TV personality. As the Founder & CEO of Venture capitalist Freigeist Capital, he focuses on seed investments like Lilium Aviation, Wunderlist, myTaxi, kaufDA and Little Lunch.",
        image:
          "https://documents.neufund.io/0x64Ee2B334454A920cE99f39Cc7557b428db8D5B8/7c1886da-75cb-47cd-a870-bd3b0cd2f28e.jpg",
        name: "Frank Thelen",
        role: "CEO at Freigeist Capital",
        website: "",
        socialChannels: [
          {
            type: ESocialChannelType.MEDIUM,
            url: "https://medium.com/@frank_thelen",
          },
          {
            type: ESocialChannelType.TWITTER,
            url: "https://twitter.com/frank_thelen",
          },
          {
            type: ESocialChannelType.LINKEDIN,
            url: "https://www.linkedin.com/in/frank-thelen/",
          },
        ],
      },
    ],
  },
  numberOfEmployees: "10-99",
  numberOfFounders: 2,
  partners: {
    members: [
      {
        description:
          "Binance is a blockchain ecosystem comprised of Exchange, Labs, Launchpad, Info and Charity Foundation. Binance Exchange is one of the fastest growing and most popular cryptocurrency exchanges in the world.",
        image:
          "https://documents.neufund.io/0x64Ee2B334454A920cE99f39Cc7557b428db8D5B8/3ed7489d-399f-46c7-a038-e423b7a94244.png",
        name: "Binance",
        role: "",
        socialChannels: [
          {
            type: ESocialChannelType.MEDIUM,
            url: "",
          },
          {
            type: ESocialChannelType.TWITTER,
            url: "https://twitter.com/binance",
          },
          {
            type: ESocialChannelType.LINKEDIN,
            url: "",
          },
        ],
        website: "https://www.binance.com/",
      },
      {
        description:
          "The Malta Stock Exchange became a reality upon enactment of the Malta Stock Exchange Act in 1990, and commenced its trading operations on 8 January 1992.",
        image:
          "https://documents.neufund.io/0x64Ee2B334454A920cE99f39Cc7557b428db8D5B8/3405980f-3bcd-48d6-aeb7-ae9cc272b984.jpg",
        name: "Malta Stock Exchange",
        role: "",
        website: "",
        socialChannels: [
          {
            type: ESocialChannelType.MEDIUM,
            url: "",
          },
          {
            type: ESocialChannelType.TWITTER,
            url: "https://twitter.com/MaltaStockExch",
          },
          {
            type: ESocialChannelType.LINKEDIN,
            url: "",
          },
        ],
      },
    ],
  },
  productVision:
    "Neufund is a blockchain based equity fundraising platform, an ecosystem of smart contracts operating on the Ethereum blockchain. The Company’s key expertise lies in legal-tech and reg-tech. At its technological core, Neufund is a Blockchain protocol for securities’ tokenization and issuance - it allows for any type of security or financial product to be issued as a token on a Blockchain, and Equity Tokens are just one of many types.",
  registrationNumber: "1234",
  riskNoLoansExist: true,
  riskNoThirdPartyDependency: true,
  riskNotRegulatedBusiness: true,
  // schemaVersion: 1,
  sellingProposition:
    "Neufund’s Equity Token Offering (ETO) is a novel way of fundraising, which allows any kind of company (blockchain-based or not) to issue equity tokens on a Blockchain, in a public or private placement. An ETO is a hybrid investment model combining advantages of an IPO, an ICO, and a VC round. Typically it is accompanied by a campaign or a roadshow which informs investors about the offering. Thus, an ETO is an ideal way to build a clients’ ecosystem around the company or a product.",
  shareholders: [
    {
      fullName: "Miau Capital GmbH",
      shareCapital: 14000,
    },
    {
      fullName: "Rudolfix Software Insights UG",
      shareCapital: 14000,
    },
    {
      fullName: "Triotor Beteiligungs GmbH",
      shareCapital: 2000,
    },
    {
      fullName: "Atlantic Labs",
      shareCapital: 5000,
    },
    {
      fullName: "Freigeist Capital I",
      shareCapital: 5500,
    },
  ],
  socialChannels: [
    {
      type: ESocialChannelType.TWITTER,
      url: "https://twitter.com/neufundorg",
    },
    {
      type: ESocialChannelType.FACEBOOK,
      url: "https://www.facebook.com/neufundorg/",
    },
    {
      type: ESocialChannelType.LINKEDIN,
      url: "https://www.linkedin.com/company/neufund/",
    },
    {
      type: ESocialChannelType.SLACK,
      url: "",
    },
    {
      type: ESocialChannelType.MEDIUM,
      url: "https://blog.neufund.org",
    },
    {
      type: ESocialChannelType.REDDIT,
      url: "https://www.reddit.com/r/neufund",
    },
    {
      type: ESocialChannelType.TELEGRAM,
      url: "https://t.me/neufund",
    },
    {
      type: ESocialChannelType.GITHUB,
      url: "https://github.com/Neufund/",
    },
    {
      type: ESocialChannelType.INSTAGRAM,
      url: "",
    },
    {
      type: ESocialChannelType.G_PLUS,
      url: "",
    },
    {
      type: ESocialChannelType.YOUTUBE,
      url: "",
    },
    {
      type: ESocialChannelType.XING,
      url: "",
    },
    {
      type: ESocialChannelType.BITCOINTALK,
      url: "",
    },
  ],
  street: "Cuvrystr 6",
  team: {
    members: [
      {
        description:
          "Being a Blockchain regulatory & security tokens experts Zoe actively advises to German and Maltese governments on DLT frameworks. Former Co-founder and CEO at Xyologic Mobile Analysis GmbH. Occasional angel investor. Mentor at Gaza Sky Geeks.",
        image:
          "https://documents.neufund.io/0x64Ee2B334454A920cE99f39Cc7557b428db8D5B8/11b3ec40-5bef-46fd-8e0a-b18e68a0a0fc.jpg",
        name: "Zoe Adamovicz",
        role: "CEO & Co-Founder",
        socialChannels: [
          {
            type: ESocialChannelType.MEDIUM,
            url: "https://medium.com/@ZoeAdamovicz",
          },
          {
            type: ESocialChannelType.TWITTER,
            url: "https://twitter.com/zoeadamovicz",
          },
          {
            type: ESocialChannelType.LINKEDIN,
            url: "https://www.linkedin.com/in/zoeadamovicz/",
          },
        ],
        website: "https://technologiaizycie.pl/",
      },
      {
        description:
          "Serial CTO and founder. Co-founder and CTO at Xyologic Mobile Analysis GmbH (exit: Digital Turbine Inc.), Head of Group Technology at Digital Turbine. Experienced in tech, from coding in assembly to managing tech teams in companies such as H&P.",
        image:
          "https://documents.neufund.io/0x64Ee2B334454A920cE99f39Cc7557b428db8D5B8/c520447a-90d8-490f-af27-16625f380b07.jpg",
        name: "Marcin Rudolf",
        role: "CTO & Co-Founder",
        website: "",
        socialChannels: [
          {
            type: ESocialChannelType.MEDIUM,
            url: "https://medium.com/@rudolfix",
          },
          {
            type: ESocialChannelType.TWITTER,
            url: "https://twitter.com/rudolfix",
          },
          {
            type: ESocialChannelType.LINKEDIN,
            url: "https://www.linkedin.com/in/marcinrudolf/",
          },
        ],
      },
      {
        description: "",
        image:
          "https://documents.neufund.io/0x64Ee2B334454A920cE99f39Cc7557b428db8D5B8/64f2b86f-1daf-45c3-9168-b0271a6d19c0.jpg",
        name: "Agnieszka Sarnecka",
        role: "VP Ventures",
        website: "",
        socialChannels: [
          {
            type: ESocialChannelType.MEDIUM,
            url: "",
          },
          {
            type: ESocialChannelType.TWITTER,
            url: "",
          },
          {
            type: ESocialChannelType.LINKEDIN,
            url: "",
          },
          {
            type: ESocialChannelType.SLACK,
            url: "",
          },
          {
            type: ESocialChannelType.REDDIT,
            url: "https://www.reddit.com/r/neufund",
          },
          {
            type: ESocialChannelType.TELEGRAM,
            url: "https://t.me/neufund",
          },
          {
            type: ESocialChannelType.GITHUB,
            url: "https://github.com/Neufund/",
          },
          {
            type: ESocialChannelType.INSTAGRAM,
            url: "",
          },
          {
            type: ESocialChannelType.G_PLUS,
            url: "",
          },
          {
            type: ESocialChannelType.YOUTUBE,
            url: "",
          },
          {
            type: ESocialChannelType.XING,
            url: "",
          },
          {
            type: ESocialChannelType.BITCOINTALK,
            url: "",
          },
        ],
      },
      {
        description: "",
        image:
          "https://documents.neufund.io/0x64Ee2B334454A920cE99f39Cc7557b428db8D5B8/2f99640f-3a3f-4f31-85fc-a11ee2dbe084.jpg",
        name: "Sergiej Rewiakin",
        role: "VP Engineering",
        socialChannels: [],
        website: "http://sergiej.com",
      },
      {
        description: "",
        image:
          "https://documents.neufund.io/0x64Ee2B334454A920cE99f39Cc7557b428db8D5B8/301abd44-1775-4991-b616-536069408fe1.jpg",
        name: "Piotr Panorski",
        role: "VP Trading",
        website: "",
        socialChannels: [
          {
            type: ESocialChannelType.TELEGRAM,
            url: "https://t.me/neufund",
          },
        ],
      },
      {
        description: "",
        image:
          "https://documents.neufund.io/0x64Ee2B334454A920cE99f39Cc7557b428db8D5B8/8fea024d-97e0-4878-bcbf-3d6538aac924.jpg",
        name: "Ula Lachowicz",
        role: "VP Marketing",
        website: "",
        socialChannels: [
          {
            type: ESocialChannelType.MEDIUM,
            url: "https://blog.neufund.org",
          },
          {
            type: ESocialChannelType.REDDIT,
            url: "https://www.reddit.com/r/neufund",
          },
          {
            type: ESocialChannelType.REDDIT,
            url: "https://t.me/neufund",
          },
        ],
      },
    ],
  },
  useOfCapitalList: [
    {
      description: "Development",
      percent: 0.4,
    },
    {
      description: "Legal",
      percent: 0.3,
    },
    {
      description: "Marketing",
      percent: 0.2,
    },
    {
      description: "Operations",
      percent: 0.1,
    },
  ],
  vatNumber: "18.08.2016",
  //zipCode: "12345",
};

export const etoDocuments: TEtoDocumentTemplates = {
  qmWKa6ZVZjZu3X2CtJnSnthUwWMeAcyfv9IZDnoawmULeT: {
    documentType: EEtoDocumentType.APPROVED_INVESTOR_OFFERING_DOCUMENT,
    form: "document",
    ipfsHash: "QmWKa6zVZjZu3x2CtJnSNTHUwWMeAcyfv9iZDnoawmULeT",
    mimeType: "application/pdf",
    language: EEtoDocumentLanguage.EN,
    name: "./dev_fixtures/eto_fixtures/ETOInPublicState/investor_offering_document.pdf",
  },
  qmc4RZuxqKkvRahSuhs6QaeRq2VoqDiMXbiHwhZTfwXUdK: {
    documentType: EEtoDocumentType.SIGNED_TERMSHEET,
    form: "document",
    ipfsHash: "Qmc4rZUXQKkvRahSUHS6qaeRq2voqDiMXbiHwhZTfwXUdK",
    mimeType: "application/pdf",
    language: EEtoDocumentLanguage.EN,
    name: "./dev_fixtures/eto_fixtures/ETOInPublicState/signed_termsheet.pdf",
  },
  aF33RZuxqKkvRahSuhs6QaeRq2VoqDiMXbiHwhZTfwXUdK: {
    documentType: EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT_PREVIEW,
    form: "document",
    ipfsHash: "QmVZvnno5v4zc96QeuGghYtp8N6JDEiACQbpM1MHyG6Uib",
    mimeType: "application/pdf",
    name:
      "./dev_fixtures/eto_fixtures/ISSUER_WHITELIST/investment_and_shareholder_agreement_preview.pdf",
  },
};

export const testContract = {
  timedState: EETOStateOnChain.Signing,
  totalInvestment: {
    totalEquivEurUlps: "3.240447910281246044e+24",
    totalTokensInt: "10010705",
    totalInvestors: "3",
    euroTokenBalance: "3.2374649e+24",
    etherTokenBalance: "5432420000000000000",
  },
  startOfStates: {
    [EETOStateOnChain.Setup]: undefined,
    [EETOStateOnChain.Whitelist]: new Date("2018-11-16T05:03:56.000Z"),
    [EETOStateOnChain.Public]: new Date("2018-11-23T05:03:56.000Z"),
    [EETOStateOnChain.Signing]: new Date("2018-12-07T05:03:56.000Z"),
    [EETOStateOnChain.Claim]: new Date("2018-12-21T05:03:56.000Z"),
    [EETOStateOnChain.Payout]: new Date("2018-12-31T05:03:56.000Z"),
    [EETOStateOnChain.Refund]: undefined,
  },
  equityTokenAddress: "0xbAb1B125ba8b4A3161b7543a4cAA38De7f9c9b2D",
  etoTermsAddress: "0x948f07847e19E7dBb98DdfFdCA4b2eDF71f3E3B5",
};

export const testProduct = {
  assetType: EAssetType.VMA,
  available: true,
  canSetTransferability: false,
  hasNominee: true,
  id: "0x0000000000000000000000000000000000000000",
  jurisdiction: EJurisdiction.GERMANY.toLowerCase() as EJurisdiction,
  // jurisdiction is left lower case on purpose to handle the instability of the backend
  maxClaimDurationDays: 30,
  maxInvestmentAmount: 0,
  maxOfferDurationDays: 90,
  maxPublicDurationDays: 60,
  maxSigningDurationDays: 60,
  maxTicketSize: 0,
  maxWhitelistDurationDays: 30,
  minClaimDurationDays: 7,
  minInvestmentAmount: 0,
  minOfferDurationDays: 1,
  minPublicDurationDays: 0,
  minSigningDurationDays: 14,
  minTicketSize: 200000,
  minWhitelistDurationDays: 0,
  name: EProductName.HNWI_ETO_DE,
  offeringDocumentType: EOfferingDocumentType.MEMORANDUM,
  offeringDocumentSubtype: EOfferingDocumentSubtype.LEAN,
  dateToWhitelistMinDuration: 7 * 24 * 60 * 60,
};

export const testEto: TEtoWithCompanyAndContractReadonly = {
  authorizedCapital: undefined,
  newSharesToIssueInFixedSlots: undefined,
  canEnableBookbuilding: false,
  companyId: "0xC8f867Cf4Ed30b4fF0Aa4c4c8c6b684397B219B0",
  currencies: [ECurrency.ETH, ECurrency.EUR_TOKEN],
  discountScheme: "40%",
  documents: etoDocuments,
  enableTransferOnSuccess: true,
  tokenTradeableOnSuccess: false,
  equityTokenImage:
    "https://documents.neufund.io/0x64Ee2B334454A920cE99f39Cc7557b428db8D5B8/a03810cf-7e99-4264-8a94-24303dce4e3b.png",
  equityTokenName: "Quintessence",
  equityTokenSymbol: toEquityTokenSymbol("QTT"),
  equityTokensPerShare: 10000,
  etoId: "0xfaDa8f267C054f469b52Ccbeb08250ACAAeE65dc" as EthereumAddressWithChecksum,
  existingShareCapital: 40976,
  shareCapitalCurrencyCode: "EUR",
  newShareNominalValue: 1,
  newShareNominalValueEur: 1,
  fixedSlotsMaximumDiscountFraction: 0.5,
  generalVotingRule: "positive",
  isBookbuilding: false,
  liquidationPreferenceMultiplier: 0.5,
  maxPledges: 500,
  maxTicketEur: 10000000,
  minTicketEur: 100,
  minimumNewSharesToIssue: 1000,
  newSharesToIssue: 3452,
  shareholdersVotingQuorum: 0.5,
  newSharesToIssueInWhitelist: 1534,
  nominee: "0xCB6470fa4b5D56C8f494e7c1CE56B28c548931a6",
  preMoneyValuationEur: 132664672.0464,
  previewCode: "deabb8a4-d081-4d15-87a7-737a09e6a87c",
  prospectusLanguage: "de",
  publicDiscountFraction: 0,
  publicDurationDays: 14,
  signingDurationDays: 14,
  startDate: "2018-11-16T05:03:56+00:00",
  state: EEtoState.ON_CHAIN,
  subState: undefined,
  hasGeneralInformationRights: true,
  hasDividendRights: true,
  tagAlongVotingRule: ETagAlongVotingRule.POSITIVE,
  generalVotingDurationDays: 10,
  restrictedActVotingDurationDays: 10,
  votingFinalizationDurationDays: 14,
  votingMajorityFraction: 0.5,
  advisoryBoard: "some description text",
  hasDragAlongRights: true,
  hasTagAlongRights: true,
  hasFoundersVesting: true,
  templates: {
    companyTokenHolderAgreement: {
      documentType: "company_token_holder_agreement" as EEtoDocumentType,
      form: "template",
      ipfsHash: "QmPKDB129q8AxxtTiX5eh9MPF6K1da5sHfqMv1a788BbuM",
      language: EEtoDocumentLanguage.EN,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      name: "company_token_holder_agreement",
    },
    investmentSummaryTemplate: {
      documentType: "investment_summary_template" as EEtoDocumentType,
      form: "template",
      ipfsHash: "QmUktiTT9ap8UuMUMZNmgrz7fabHMkrosycuTPUtX3rydQ",
      language: EEtoDocumentLanguage.EN,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      name: "investment_and_shareholder_agreement_template",
    },
    prospectusTemplate: {
      documentType: "prospectus_template" as EEtoDocumentType,
      form: "template",
      ipfsHash: "QmQYWyx6WWwCYqBnJ74ruogTTHfKoscQRHU5eJFKDD22mT",
      language: EEtoDocumentLanguage.DE,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      name: "prospectus_template_de",
    },
    reservationAndAcquisitionAgreement: {
      documentType: "reservation_and_acquisition_agreement" as EEtoDocumentType,
      form: "template",
      ipfsHash: "QmekA9D4pa5Tsmd2krzUFFREGAduDDkbpNyoin4wX7aaob",
      language: EEtoDocumentLanguage.EN,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      name: "reservation_and_acquisition_agreement",
    },
    termsheetTemplate: {
      documentType: "termsheet_template" as EEtoDocumentType,
      form: "template",
      ipfsHash: "QmRLwyTw4ux84KnYvhejTsUggi2SeewGqASuh3DrURtyot",
      language: EEtoDocumentLanguage.EN,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      name: "termsheet_template",
    },
  },
  investmentCalculatedValues: {
    sharePrice: 3237.61892987893,
    canBeListed: true,
    canGoOnChain: true,
    publicSharePrice: 3237.618912123,
    effectiveMaxTicket: 5000000,
    maxInvestmentAmount: 5000000,
    minInvestmentAmount: 1618809.45217126312,
    discountedSharePrice: 2266.333231267162,
    fixedSlotsMinSharePrice: 1618.80945127718,
    maxInvestmentAmountWithAllDiscounts: 5000000,
  },
  whitelistDiscountFraction: 0.3,
  whitelistDurationDays: 7,
  company: testCompany,
  contract: testContract,
  product: testProduct,
  isMarketingDataVisibleInPreview: EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
};

export const etoFilesData: IEtoFilesInfo = {
  productTemplates: {
    companyTokenHolderAgreement: {
      documentType: EEtoDocumentType.COMPANY_TOKEN_HOLDER_AGREEMENT,
      form: "template" as TEtoFormType,
      ipfsHash: "QmVEJvxmo4M5ugvfSQfKzejW8cvXsWe8261MpGChov7DQt",
      language: EEtoDocumentLanguage.EN,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      name: "company_token_holder_agreement",
    },
    investmentSummaryTemplate: {
      documentType: EEtoDocumentType.INVESTMENT_SUMMARY_TEMPLATE,
      form: "template" as TEtoFormType,
      ipfsHash: "QmYEGp8hoYnBptD2UUAuDrsx2jMRkf8Evgc3d5J5ZK9xQY",
      language: EEtoDocumentLanguage.EN,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      name: "investment_and_shareholder_agreement_template",
    },
    investmentMemorandumTemplate: {
      documentType: EEtoDocumentType.INVESTMENT_MEMORANDUM_TEMPLATE,
      form: "template" as TEtoFormType,
      ipfsHash: "QmUx5R5BsbwWAymRqN7QcZDSCZU7Sqvv1rDB4dYjVt8BRu",
      language: EEtoDocumentLanguage.EN,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      name: "investment_memorandum_template",
    },
    prospectusTemplate: {
      documentType: EEtoDocumentType.PROSPECTUS_TEMPLATE,
      form: "template" as TEtoFormType,
      ipfsHash: "QmQYWyx6WWwCYqBnJ74ruogTTHfKoscQRHU5eJFKDD22mT",
      language: EEtoDocumentLanguage.DE,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      name: "prospectus_template_de",
    },
    reservationAndAcquisitionAgreement: {
      documentType: EEtoDocumentType.RESERVATION_AND_ACQUISITION_AGREEMENT,
      form: "template" as TEtoFormType,
      ipfsHash: "QmYNq3z1gLhooZpXhYvBUf9b99H4NAFS6NRTpYaHqdYAV5",
      language: EEtoDocumentLanguage.EN,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      name: "reservation_and_acquisition_agreement",
    },
    termsheetTemplate: {
      documentType: EEtoDocumentType.TERMSHEET_TEMPLATE,
      form: "template" as TEtoFormType,
      ipfsHash: "QmRLwyTw4ux84KnYvhejTsUggi2SeewGqASuh3DrURtyot",
      language: EEtoDocumentLanguage.EN,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      name: "termsheet_template",
    },
  },
  documentsStateInfo: {
    canDeleteInStates: {
      listed: [EEtoDocumentType.APPROVED_INVESTOR_OFFERING_DOCUMENT],
      onChain: [EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT],
      pending: [EEtoDocumentType.SIGNED_TERMSHEET],
      preview: [EEtoDocumentType.SIGNED_TERMSHEET],
      prospectusApproved: [],
      suspended: [],
    },
    canUploadInStates: {
      listed: [EEtoDocumentType.APPROVED_INVESTOR_OFFERING_DOCUMENT],
      onChain: [EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT],
      pending: [EEtoDocumentType.SIGNED_TERMSHEET],
      preview: [EEtoDocumentType.SIGNED_TERMSHEET],
      prospectusApproved: [],
      suspended: [],
    },
    uploadableTypes: [
      "signed_termsheet",
      "approved_investor_offering_document",
      "investment_and_shareholder_agreement",
    ] as EEtoDocumentType[],
    generatedTypes: [],
  },
};

export const etoTemplates: TEtoDocumentTemplates = {
  companyTokenHolderAgreement: {
    documentType: EEtoDocumentType.COMPANY_TOKEN_HOLDER_AGREEMENT,
    form: "template" as TEtoFormType,
    ipfsHash: "QmbKpkoqJsdf7yqh7bA4RXBS7hDMCFQPigeMuMQNude8cN",
    language: EEtoDocumentLanguage.EN,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "company_token_holder_agreement",
  },
  investmentSummaryTemplate: {
    documentType: EEtoDocumentType.INVESTMENT_SUMMARY_TEMPLATE,
    form: "template" as TEtoFormType,
    ipfsHash: "QmRTdEqegYu3eh4qbzQsS16idRaNsdiSn4uGbbjERWWNKV",
    language: EEtoDocumentLanguage.EN,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "investment_and_shareholder_agreement_template",
  },
  prospectusTemplate: {
    documentType: EEtoDocumentType.PROSPECTUS_TEMPLATE,
    form: "template",
    ipfsHash: "QmQYWyx6WWwCYqBnJ74ruogTTHfKoscQRHU5eJFKDD22mT",
    language: EEtoDocumentLanguage.DE,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "prospectus_template_de",
  },
  reservationAndAcquisitionAgreement: {
    documentType: EEtoDocumentType.RESERVATION_AND_ACQUISITION_AGREEMENT,
    form: "template" as TEtoFormType,
    ipfsHash: "QmU33GZ1dhrW8u7qeZZfjTPBBnmYsF1ZqhoQRhSqhXqVBq",
    language: EEtoDocumentLanguage.EN,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "reservation_and_acquisition_agreement",
  },
  termsheetTemplate: {
    documentType: EEtoDocumentType.TERMSHEET_TEMPLATE,
    form: "template" as TEtoFormType,
    ipfsHash: "QmRLwyTw4ux84KnYvhejTsUggi2SeewGqASuh3DrURtyot",
    language: EEtoDocumentLanguage.EN,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "termsheet_template",
  },
};
