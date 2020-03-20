import { convertToUlps } from "@neufund/shared";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { testEto } from "../../../test/fixtures";
import { EETOStateOnChain, IEtoTokenData } from "../../modules/eto/types";
import { IInvestorTicket, TETOWithTokenData } from "../../modules/investor-portfolio/types";
import { LoadingIndicator } from "../shared/loading-indicator/LoadingIndicator";
import { WarningAlert } from "../shared/WarningAlert";
import {
  PortfolioMyAssetsLayout,
  PortfolioMyAssetsLayoutContainer,
  PortfolioMyAssetsNoAssets,
} from "./PortfolioMyAssets";

const eto = ({
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
  tokenData: {
    balance: "6716093",
    canTransferToken: true,
    companyValuationEurUlps: "4.6456834532374100674e+25",
    tokenPrice: "161870503597122302",
    tokensPerShare: "1000000",
    totalCompanyShares: "2.87e+22",
  } as IEtoTokenData,
} as unknown) as TETOWithTokenData;

const myAssetsData = {
  walletAddress: "0xfA1Af2E251ee739F83e14d7daCfd77B3d0E930b7",
  myNeuBalance: convertToUlps("3325466.7332"),
  neuPrice: "0.12551182969085822",
  neumarkAddress: "0x027a7a3991c4dd1dcb9db3f9a4dda8bab4d58f2f",
  neuValue: convertToUlps("374212.86"),
  myAssets: [eto],
  totalEurEquiv: convertToUlps("1461350.21"),
  totalQuantity: convertToUlps("10041559.7332"),
  priceAverage: convertToUlps("0.1371"),
  startTokenTransfer: action("START_TOKEN_TRANSFER"),
  showDownloadAgreementModal: action("SHOW_AGREEMENT_MODAL"),
  isRetailEto: false,
  hasError: false,
  tokenLoaded: true,
  setTokenLoaded: action("SET_TOKEN_LOADED"),
};

storiesOf("Portfolio/PortfolioMyAssets", module)
  .add("default", () => (
    <PortfolioMyAssetsLayoutContainer>
      <PortfolioMyAssetsLayout {...myAssetsData} />
    </PortfolioMyAssetsLayoutContainer>
  ))
  .add("no assets", () => (
    <PortfolioMyAssetsLayoutContainer>
      <PortfolioMyAssetsNoAssets />
    </PortfolioMyAssetsLayoutContainer>
  ))
  .add("loading", () => (
    <PortfolioMyAssetsLayoutContainer>
      <LoadingIndicator className="m-auto" />
    </PortfolioMyAssetsLayoutContainer>
  ))
  .add("error", () => (
    <PortfolioMyAssetsLayoutContainer>
      {" "}
      <WarningAlert data-test-id="my-neu-widget-error" className="m-auto">
        <FormattedMessage id="common.error" values={{ separator: " " }} />
      </WarningAlert>
    </PortfolioMyAssetsLayoutContainer>
  ));
