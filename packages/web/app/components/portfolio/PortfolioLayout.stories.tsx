import { convertToUlps, ECurrency, ETH_DECIMALS } from "@neufund/shared";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { withStore } from "../../utils/react-connected-components/storeDecorator.unsafe";
import { PortfolioLayout, TPortfolioLayoutProps } from "./PortfolioLayout";

const data: TPortfolioLayoutProps = {
  myAssets: [],
  pendingAssets: [],
  pastInvestments: [],
  isRetailEto: false,
  walletAddress: "0x00000",
  isVerifiedInvestor: true,
  tokensDisbursal: [
    {
      token: ECurrency.EUR_TOKEN,
      amountToBeClaimed: "11200657227385184",
      timeToFirstDisbursalRecycle: 1675062154000,
      totalDisbursedAmount: "364458900000000000",
      tokenDecimals: ETH_DECIMALS,
      amountEquivEur: convertToUlps("11200657227385184"),
    },
    {
      token: ECurrency.ETH,
      amountToBeClaimed: "01200657227385184",
      timeToFirstDisbursalRecycle: 1675062154000,
      totalDisbursedAmount: "064458900000000000",
      tokenDecimals: ETH_DECIMALS,
      amountEquivEur: convertToUlps("125677344737433"),
    },
  ],
  tokenDisbursalIsLoading: false,
  tokenDisbursalError: false,
  tokensDisbursalEurEquivTotal: convertToUlps("123"),
  tokensDisbursalEurEquivTotalDisbursed: convertToUlps("4521"),
  etosError: false,
};

storiesOf("Portfolio/PortfolioLayout", module)
  .addDecorator(withStore({}))
  .add("default", () => <PortfolioLayout {...data} />)
  .add("minimal Amount", () => (
    <PortfolioLayout
      {...{
        ...data,
        tokensDisbursal: [
          {
            token: ECurrency.EUR_TOKEN,
            amountToBeClaimed: "12",
            timeToFirstDisbursalRecycle: 1675062154000,
            totalDisbursedAmount: "364458900000000000",
            amountEquivEur: convertToUlps("12"),
            tokenDecimals: ETH_DECIMALS,
          },
          {
            token: ECurrency.ETH,
            amountToBeClaimed: "12",
            timeToFirstDisbursalRecycle: 1675062154000,
            totalDisbursedAmount: "064458900000000000",
            amountEquivEur: convertToUlps("123"),
            tokenDecimals: ETH_DECIMALS,
          },
        ],
      }}
    />
  ));
