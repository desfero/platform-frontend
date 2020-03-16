import { ECurrency, toEquityTokenSymbol } from "@neufund/shared";
import { storiesOf } from "@storybook/react";
import * as moment from "moment";
import * as React from "react";

import { testEto } from "../../../../../test/fixtures";
import { EKycRequestStatus } from "../../../../lib/api/kyc/KycApi.interfaces";
import { EUserType } from "../../../../lib/api/users/interfaces";
import {
  EETOStateOnChain,
  TEtoContractData,
  TEtoWithCompanyAndContractReadonly,
} from "../../../../modules/eto/types";
import { withStore } from "../../../../utils/react-connected-components/storeDecorator.unsafe";
import { withMockedDate } from "../../../../utils/react-connected-components/storybookHelpers.unsafe";
import { EtoOverviewStatus } from "./EtoOverviewStatus";

const eto: TEtoWithCompanyAndContractReadonly = {
  ...testEto,
  preMoneyValuationEur: 10000,
  existingShareCapital: 10,
  equityTokensPerShare: 10,
  publicDiscountFraction: 0.2,
  whitelistDiscountFraction: 0.3,
  maxPledges: 100,
  maxTicketEur: 1000,
  minTicketEur: 1,
  equityTokenName: "TokenName",
  equityTokenSymbol: toEquityTokenSymbol("TKN"),
  company: { ...testEto.company, brandName: "BrandName" },
  contract: {
    ...testEto.contract!,
    timedState: EETOStateOnChain.Whitelist,
  },
};
// 2018-11-16T05:03:56.000Z
// Fri Nov 23 2018 06:03:56 GMT+0100
const dummyNow = new Date("2018-10-16T05:03:56+00:00");

const testStore = {
  auth: {
    jwt: "bla",
    user: {
      type: EUserType.INVESTOR,
      verifiedEmail: "asfasdf@asfa.dd",
    },
  },
  kyc: {
    individualRequestState: {
      status: EKycRequestStatus.ACCEPTED,
    },
    claims: {
      isVerified: true,
    },
  },
  eto: {
    etos: { [eto.previewCode]: eto },
    companies: { [eto.companyId]: eto.company },
    contracts: { [eto.previewCode]: eto.contract },
  },
  bookBuildingFlow: {
    bookbuildingStats: {
      [eto.etoId]: {
        investorsCount: 3,
        pledgedAmount: 500,
      },
    },
    pledges: {
      [eto.etoId]: {
        amountEur: 100,
        currency: ECurrency.EUR_TOKEN,
        consentToRevealEmail: true,
      },
    },
  },
} as const;

storiesOf("ETO/EtoOverviewStatus", module)
  .addDecorator(
    withStore({
      auth: {
        jwt: "bla",
        user: {
          type: EUserType.INVESTOR,
          verifiedEmail: "asfasdf@asfa.dd",
        },
      },
      kyc: {
        claims: {
          isVerified: true,
        },
      },
      eto: {
        etos: { [eto.previewCode]: eto },
        companies: { [eto.companyId]: eto.company },
        contracts: { [eto.previewCode]: eto.contract },
      },
      bookBuildingFlow: {
        bookbuildingStats: {
          [eto.etoId]: {
            investorsCount: 3,
            pledgedAmount: 500,
          },
        },
        pledges: {
          [eto.etoId]: {
            amountEur: 100,
            currency: ECurrency.EUR_TOKEN,
            consentToRevealEmail: true,
          },
        },
      },
    }),
  )
  .addDecorator(withMockedDate(dummyNow))
  .add("default", () => <EtoOverviewStatus eto={eto} publicView={false} isEmbedded={true} />)
  .add("not public", () => <EtoOverviewStatus eto={eto} isEmbedded={false} publicView={false} />)
  .add("with whitelist discount", () => (
    <EtoOverviewStatus eto={eto} isEmbedded={true} publicView={false} />
  ))
  .add("without discount", () => (
    <EtoOverviewStatus
      eto={{ ...eto, publicDiscountFraction: 0 }}
      isEmbedded={true}
      publicView={false}
    />
  ))
  .add("whitelisted not eligible", () => (
    <EtoOverviewStatus eto={{ ...eto }} isEmbedded={true} publicView={false} />
  ))
  .add("successful", () => (
    <EtoOverviewStatus
      eto={{
        ...eto,
        isBookbuilding: true,
        contract: { ...eto.contract, timedState: EETOStateOnChain.Claim } as TEtoContractData,
      }}
      isEmbedded={true}
      publicView={false}
    />
  ))
  .add("whitelisting", () => (
    <EtoOverviewStatus
      eto={{
        ...eto,
        isBookbuilding: true,
        minTicketEur: 50,
        maxTicketEur: 100,
        maxPledges: 5,
        contract: {
          ...eto.contract,
          timedState: EETOStateOnChain.Setup,
          startOfStates: {
            ...eto.contract!.startOfStates,
            [EETOStateOnChain.Public]: moment()
              .add(7, "days")
              .toDate(),
          },
        } as TEtoContractData,
      }}
      isEmbedded={true}
      publicView={false}
    />
  ))
  .add(
    "max cap exceeded, user whitelisted",
    () => (
      <EtoOverviewStatus
        eto={{
          ...eto,
          contract: {
            ...eto.contract,
            startOfStates: {
              ...eto.contract!.startOfStates,
              [EETOStateOnChain.Public]: moment()
                .add(7, "days")
                .toDate(),
            },
          } as TEtoContractData,
        }}
        isEmbedded={true}
        publicView={false}
      />
    ),
    {
      decorators: [withStore(testStore)],
    },
  )
  .add(
    "max cap exceeded, user not whitelisted",
    () => (
      <EtoOverviewStatus
        eto={{
          ...eto,
          contract: {
            ...eto.contract,
            timedState: EETOStateOnChain.Public,
          } as TEtoContractData,
        }}
        isEmbedded={true}
        publicView={false}
      />
    ),
    {
      decorators: [withStore(testStore)],
    },
  );

storiesOf("ETO/EtoOverviewStatus/whitelisting, investor limit reached", module)
  .addDecorator(
    withStore({
      auth: {
        jwt: "bla",
        user: {
          type: EUserType.INVESTOR,
          verifiedEmail: "asfasdf@asfa.dd",
        },
      },
      kyc: {
        claims: {
          isVerified: true,
        },
      },
      eto: {
        etos: { [eto.previewCode]: eto },
        companies: { [eto.companyId]: eto.company },
        contracts: { [eto.previewCode]: eto.contract },
      },
      bookBuildingFlow: {
        bookbuildingStats: {
          [eto.etoId]: {
            investorsCount: 5,
            pledgedAmount: 500,
          },
        },
        pledges: {
          [eto.etoId]: {
            amountEur: 100,
            currency: ECurrency.EUR_TOKEN,
            consentToRevealEmail: true,
          },
        },
      },
    }),
  )
  .addDecorator(withMockedDate(dummyNow))
  .add("whitelisting, investor limit reached", () => (
    <EtoOverviewStatus
      eto={{
        ...eto,
        isBookbuilding: true,
        minTicketEur: 50,
        maxTicketEur: 100,
        maxPledges: 5,
        contract: {
          ...eto.contract,
          timedState: EETOStateOnChain.Setup,
          startOfStates: {
            ...eto.contract!.startOfStates,
            [EETOStateOnChain.Public]: moment()
              .add(7, "days")
              .toDate(),
          },
        } as TEtoContractData,
      }}
      isEmbedded={true}
      publicView={false}
    />
  ));
