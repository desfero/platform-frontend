import { EWalletSubType, EWalletType } from "@neufund/shared-modules";
import { DeepPartial } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";

import { TAppGlobalState } from "../../app/store";
import { testCompany, testEto } from "../fixtures";

export const mockedStore: DeepPartial<TAppGlobalState> = {
  etoIssuer: {
    eto: testEto,
    company: testCompany,
  },
  contracts: {
    platformTermsConstants: {
      IS_ICBM_INVESTOR_WHITELISTED: true,
      PLATFORM_NEUMARK_SHARE: new BigNumber("2"),
      TOKEN_PARTICIPATION_FEE_FRACTION: new BigNumber("20000000000000000"),
      PLATFORM_FEE_FRACTION: new BigNumber("30000000000000000"),
      TOKEN_RATE_EXPIRES_AFTER: new BigNumber("14400"),
    },
  },
  web3: {
    connected: true,
    wallet: {
      address: "0xa2133ccd9560a140c5399529d3e751bf3f13877f",
      email: "storybook@neufund.org",
      salt: "qwerty123=",
      walletType: EWalletType.LIGHT,
      walletSubType: EWalletSubType.UNKNOWN,
    },
  },
  auth: {
    currentAgreementHash: "qwerty123",
  },
  wallet: {
    loading: false,
    data: {
      euroTokenICBMLockedWallet: {
        LockedBalance: "0",
        neumarksDue: "0",
        unlockDate: "0",
      },
      etherTokenICBMLockedWallet: {
        LockedBalance: "0",
        neumarksDue: "0",
        unlockDate: "0",
      },
      euroTokenLockedWallet: {
        LockedBalance: "0",
        neumarksDue: "0",
        unlockDate: "0",
      },
      etherTokenLockedWallet: {
        LockedBalance: "0",
        neumarksDue: "0",
        unlockDate: "0",
      },
      etherTokenUpgradeTarget: "",
      euroTokenUpgradeTarget: "",
      etherTokenBalance: "0",
      euroTokenBalance: "0",
      etherBalance: "0",
      neuBalance: "0",
    },
  },
  eto: {
    etos: { [testEto.previewCode]: testEto },
    companies: { [testEto.companyId]: testEto.company },
    contracts: { [testEto.previewCode]: testEto.contract },
    displayOrder: [testEto.previewCode],
  },
  bookBuildingFlow: {
    bookbuildingStats: {
      [testEto.etoId]: {
        investorsCount: 10,
        pledgedAmount: 500,
      },
    },
    pledges: {},
  },
  investorTickets: {
    calculatedContributions: {},
    initialCalculatedContributions: {},
    investorEtoTickets: {},
    tokensDisbursal: {
      loading: false,
      error: false,
      data: [],
    },
    incomingPayouts: {
      loading: false,
      error: false,
      data: {
        euroTokenIncomingPayoutValue: "0",
        etherTokenIncomingPayoutValue: "0",
        snapshotDate: 1580688000,
      },
    },
    tokensPersonalDiscounts: {},
  },
};
