import { convertToUlps } from "@neufund/shared";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { testEto } from "../../../test/fixtures";
import { EETOStateOnChain } from "../../modules/eto/types";
import { IInvestorTicket, TETOWithInvestorTicket } from "../../modules/investor-portfolio/types";
import { LoadingIndicator } from "../shared/loading-indicator/LoadingIndicator";
import { WarningAlert } from "../shared/WarningAlert";
import {
  PortfolioReservedAssetsContainer,
  PortfolioReservedAssetsLayout,
  PortfolioReservedAssetsNoAssets,
} from "./PortfolioReservedAssets";

const eto = {
  ...testEto,
  contract: {
    ...testEto.contract,
    timedState: EETOStateOnChain.Payout,
  },
  investorTicket: {
    equivEurUlps: convertToUlps("738.46"),
    rewardNmkUlps: convertToUlps("1234.2212"),
    equityTokenInt: "2280",
    tokenPrice: convertToUlps("0.373"),
  } as IInvestorTicket,
} as TETOWithInvestorTicket;

const secondEto = {
  ...eto,
  equityTokenName: "Storybook",
  equityTokenSymbol: "STR",
  investorTicket: {
    ...eto.investorTicket,
    equivEurUlps: convertToUlps("12452.46"),
    equityTokenInt: "123422",
    rewardNmkUlps: convertToUlps("4537.235"),
  },
} as TETOWithInvestorTicket;

const reservedAssetsData = {
  pendingAssets: [eto, secondEto],
  pendingAssetsTotalInvested: convertToUlps("10436170.73"),
  pendingAssetsTotalQuantity: "21830965",
  pendingAssetsAveragePrice: "0.3730",
  pendingAssetsTotalReward: convertToUlps("31875101.3922"),
  hasError: false,
};

storiesOf("Portfolio/PortfolioReservedAssets", module)
  .add("default", () => (
    <PortfolioReservedAssetsContainer>
      <PortfolioReservedAssetsLayout {...reservedAssetsData} />
    </PortfolioReservedAssetsContainer>
  ))
  .add("no assets", () => (
    <PortfolioReservedAssetsContainer>
      <PortfolioReservedAssetsNoAssets />
    </PortfolioReservedAssetsContainer>
  ))
  .add("loading", () => (
    <PortfolioReservedAssetsContainer>
      <LoadingIndicator className="m-auto" />
    </PortfolioReservedAssetsContainer>
  ))
  .add("error", () => (
    <PortfolioReservedAssetsContainer>
      <WarningAlert data-test-id="my-neu-widget-error" className="m-auto">
        <FormattedMessage id="common.error" values={{ separator: " " }} />
      </WarningAlert>
    </PortfolioReservedAssetsContainer>
  ));
