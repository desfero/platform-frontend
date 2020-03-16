import { ECurrency } from "@neufund/shared";
import { storiesOf } from "@storybook/react";
import * as moment from "moment";
import * as React from "react";

import { testEto } from "../../../../../../test/fixtures";
import { EWhitelistingState } from "../../../../../modules/bookbuilding-flow/utils";
import { EETOStateOnChain } from "../../../../../modules/eto/types";
import { withMockedDate } from "../../../../../utils/react-connected-components/storybookHelpers.unsafe";
import { Panel } from "../../../../shared/Panel";
import { CampaigningActivatedWidgetLayout } from "./CampaigningActivatedWidget";

const dummyNow = new Date("10/3/2019");

storiesOf("ETO/CampaigningActivatedWidgetLayout", module)
  .addDecorator(story => <Panel>{story()}</Panel>)
  .addDecorator(withMockedDate(dummyNow))
  .add("Active, not authorized, no investors pledged", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Whitelist}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={0}
      investorsCount={0}
      isInvestor={false}
      isVerifiedInvestor={false}
      isAuthorized={false}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Active, not authorized, some investors pledged", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Whitelist}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10000}
      investorsCount={5}
      isInvestor={false}
      isVerifiedInvestor={false}
      isAuthorized={false}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Active, verified investor view, investor didn't pledge", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={0}
      investorsCount={5}
      isInvestor={true}
      isVerifiedInvestor={true}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Active, verified investor view, investor did pledge", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={5}
      isInvestor={true}
      isVerifiedInvestor={true}
      pledge={{ amountEur: 999, currency: ECurrency.EUR_TOKEN, consentToRevealEmail: true }}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Active, non-verified-investor view", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={1}
      isInvestor={true}
      isVerifiedInvestor={false}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Active, non-investor view", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={1}
      isInvestor={false}
      isVerifiedInvestor={false}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Suspended, is verified investor, has pledged", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.SUSPENDED}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={8}
      isInvestor={true}
      isVerifiedInvestor={true}
      pledge={{ amountEur: 999, currency: ECurrency.EUR_TOKEN, consentToRevealEmail: true }}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Suspended, is verified investor, has not pledged", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.SUSPENDED}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={8}
      isInvestor={true}
      isVerifiedInvestor={true}
      pledge={undefined}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Suspended, is investor, is not a verified investor", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.SUSPENDED}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={8}
      isInvestor={true}
      isVerifiedInvestor={false}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Suspended, is not an investor", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.SUSPENDED}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={8}
      isInvestor={false}
      isVerifiedInvestor={false}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("NotActive, is verified investor", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.NOT_ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={0}
      investorsCount={1}
      isInvestor={true}
      isVerifiedInvestor={true}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("NotActive, not an investor", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.NOT_ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={0}
      investorsCount={1}
      isInvestor={false}
      isVerifiedInvestor={false}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Investor Limit Reached, is verified investor, has pledged, next start date not set", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.LIMIT_REACHED}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={18}
      isInvestor={true}
      isVerifiedInvestor={true}
      pledge={{ amountEur: 999, currency: ECurrency.EUR_TOKEN, consentToRevealEmail: true }}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add(
    "Investor Limit Reached, is verified investor, has not pledged, next start date not set",
    () => (
      <CampaigningActivatedWidgetLayout
        whitelistingState={EWhitelistingState.LIMIT_REACHED}
        countdownDate={undefined}
        etoId="test"
        investorsLimit={500}
        minPledge={10}
        nextState={EETOStateOnChain.Public}
        keyQuoteFounder="Quotes are like boats"
        pledgedAmount={10007584930223}
        investorsCount={1}
        isInvestor={true}
        isVerifiedInvestor={true}
        isAuthorized={true}
        isEmbedded={false}
        investmentCalculatedValues={testEto.investmentCalculatedValues}
      />
    ),
  )
  .add(
    "Investor Limit Reached, is investor, is not a verified investor, next start date not set",
    () => (
      <CampaigningActivatedWidgetLayout
        whitelistingState={EWhitelistingState.LIMIT_REACHED}
        countdownDate={undefined}
        etoId="test"
        investorsLimit={500}
        minPledge={10}
        nextState={EETOStateOnChain.Public}
        keyQuoteFounder="Quotes are like boats"
        pledgedAmount={10007584930223}
        investorsCount={1}
        isInvestor={true}
        isVerifiedInvestor={false}
        isAuthorized={true}
        isEmbedded={false}
        investmentCalculatedValues={testEto.investmentCalculatedValues}
      />
    ),
  )
  .add("Investor Limit Reached, is not an investor, next start date not set", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.LIMIT_REACHED}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={12}
      isInvestor={false}
      isVerifiedInvestor={false}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Investor Limit Reached, Start date is set, is verified investor", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.LIMIT_REACHED}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      countdownDate={moment(dummyNow)
        .add(3, "day")
        .toDate()}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={12}
      isInvestor={true}
      isVerifiedInvestor={true}
      pledge={{ amountEur: 999, currency: ECurrency.EUR_TOKEN, consentToRevealEmail: true }}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Investor Limit Reached, Start date is set, is investor, not a verified investor", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.LIMIT_REACHED}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      countdownDate={moment(dummyNow)
        .add(3, "day")
        .toDate()}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={1}
      isInvestor={true}
      isVerifiedInvestor={false}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ))
  .add("Investor Limit Reached, Start date is set, is not an investor", () => (
    <CampaigningActivatedWidgetLayout
      whitelistingState={EWhitelistingState.LIMIT_REACHED}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      countdownDate={moment(dummyNow)
        .add(3, "day")
        .toDate()}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={1}
      isInvestor={false}
      isVerifiedInvestor={false}
      isAuthorized={true}
      isEmbedded={false}
      investmentCalculatedValues={testEto.investmentCalculatedValues}
    />
  ));
