import { ECurrency, ETH_DECIMALS } from "@neufund/shared";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { withStore } from "../../../../utils/react-connected-components/storeDecorator.unsafe";
import { IncomingPayoutAvailableBase } from "./IncomingPayoutAvailable";
import { IncomingPayoutPendingLayout } from "./IncomingPayoutPending";
import { IncomingPayoutWaitingLayout } from "./IncomingPayoutWaiting";
import { WelcomeToNeufund } from "./WelcomeToNeufund";

const testStore = {
  investorTickets: {
    incomingPayouts: {
      data: {
        etherTokenIncomingPayoutValue: "128128120000000000000",
        euroTokenIncomingPayoutValue: "1.1000012812e+23",
      },
    },
  },
};

storiesOf("IncomingPayoutWidget", module)
  .add("Welcome", () => <WelcomeToNeufund />)
  .add(
    "IncomingPayoutPending",
    () => (
      <IncomingPayoutPendingLayout
        etherTokenIncomingPayout={"123456456132123456785"}
        euroTokenIncomingPayout={"123456456137654345672"}
        endDate={new Date("2018-03-10T05:03:56+02:00")}
        loadPayoutsData={action("loadPayoutsData")}
      />
    ),
    { decorators: [withStore(testStore)] },
  )
  .add(
    "IncomingPayoutWaiting",
    () => (
      <IncomingPayoutWaitingLayout
        etherTokenIncomingPayout={"123456456132123456785"}
        euroTokenIncomingPayout={"123456456137654345672"}
      />
    ),
    { decorators: [withStore(testStore)] },
  )
  .add(
    "IncomingPayoutAvailable",
    () => (
      <IncomingPayoutAvailableBase
        tokensDisbursal={[
          {
            token: ECurrency.EUR_TOKEN,
            amountToBeClaimed: "11200657227385184",
            timeToFirstDisbursalRecycle: 1675062154000,
            totalDisbursedAmount: "364458900000000000",
            tokenDecimals: ETH_DECIMALS,
            amountEquivEur: "984609705509027210028",
          },
          {
            token: ECurrency.ETH,
            amountToBeClaimed: "01200657227385184",
            timeToFirstDisbursalRecycle: 1675062154000,
            totalDisbursedAmount: "064458900000000000",
            tokenDecimals: ETH_DECIMALS,
            amountEquivEur: "97078346877766094590.21980140173352",
          },
        ]}
      />
    ),

    { decorators: [withStore(testStore)] },
  )
  .add(
    "IncomingPayoutAvailable-MinimalAmount",
    () => (
      <IncomingPayoutAvailableBase
        tokensDisbursal={[
          {
            token: ECurrency.EUR_TOKEN,
            amountToBeClaimed: "00000657227385184",
            timeToFirstDisbursalRecycle: 1675062154000,
            totalDisbursedAmount: "364458900000000000",
            tokenDecimals: ETH_DECIMALS,
            amountEquivEur: "984609705509027210028",
          },
          {
            token: ECurrency.ETH,
            amountToBeClaimed: "00000657227385184",
            timeToFirstDisbursalRecycle: 1675062154000,
            totalDisbursedAmount: "064458900000000000",
            tokenDecimals: ETH_DECIMALS,
            amountEquivEur: "97078346877766094590.21980140173352",
          },
        ]}
      />
    ),

    { decorators: [withStore(testStore)] },
  )
  .add(
    "IncomingPayoutAvailable-ZeroAmount",
    () => (
      <IncomingPayoutAvailableBase
        tokensDisbursal={[
          {
            token: ECurrency.EUR_TOKEN,
            amountToBeClaimed: "0",
            timeToFirstDisbursalRecycle: 1675062154000,
            totalDisbursedAmount: "364458900000000000",
            tokenDecimals: ETH_DECIMALS,
            amountEquivEur: "0",
          },
          {
            token: ECurrency.ETH,
            amountToBeClaimed: "0",
            timeToFirstDisbursalRecycle: 1675062154000,
            totalDisbursedAmount: "064458900000000000",
            tokenDecimals: ETH_DECIMALS,
            amountEquivEur: "0",
          },
        ]}
      />
    ),

    { decorators: [withStore(testStore)] },
  );
