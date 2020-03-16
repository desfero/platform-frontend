import { ECurrency, ETH_DECIMALS } from "@neufund/shared";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as moment from "moment";
import * as React from "react";

import { ITokenDisbursal } from "../../../../modules/investor-portfolio/types";
import {
  withMockedDate,
  withModalBody,
} from "../../../../utils/react-connected-components/storybookHelpers.unsafe";
import { InvestorAcceptPayoutSuccessLayout } from "./AcceptSuccess";

const ethTokenDisbursal: ITokenDisbursal = {
  token: ECurrency.ETH,
  amountToBeClaimed: "6.582870355588135389497e+21",
  totalDisbursedAmount: "9.7154607e+22",
  timeToFirstDisbursalRecycle: 1675401473000,
  tokenDecimals: ETH_DECIMALS,
  amountEquivEur: "984609705509027210028",
};

const nEurTokenDisbursal: ITokenDisbursal = {
  token: ECurrency.EUR_TOKEN,
  amountToBeClaimed: "6.582870355588135389497e+21",
  totalDisbursedAmount: "9.7154607e+22",
  timeToFirstDisbursalRecycle: 1675401473000,
  tokenDecimals: ETH_DECIMALS,
  amountEquivEur: "97078346877766094590.21980140173352",
};

const dummyNow = new Date("10/3/2019");
const date = moment.utc(dummyNow).subtract(1, "day");

const props = {
  txTimestamp: date.valueOf(),
  additionalData: { tokensDisbursals: [ethTokenDisbursal, nEurTokenDisbursal] },
  goToWallet: action("View Wallet"),
};

storiesOf("InvestorPayout/AcceptSuccess", module)
  .addDecorator(withModalBody())
  .addDecorator(withMockedDate(dummyNow))
  .add("default", () => <InvestorAcceptPayoutSuccessLayout {...props} />);
