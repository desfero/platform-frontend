import { Q18 } from "@neufund/shared-utils";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { ETxType, ITxData } from "../../../../lib/web3/types";
import { TAdditionalDataByType } from "../../../../modules/tx/types";
import { withModalBody } from "../../../../utils/react-connected-components/storybookHelpers.unsafe";
import { RefundSummaryLayout } from "./RefundSummary";

const txData: ITxData = {
  to: "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359",
  value: "5500000000000000000",
  gas: "12000",
  gasPrice: "57000000000",
  from: "0x8e75544b848f0a32a1ab119e3916ec7138f3bed2",
};

const additionalData: TAdditionalDataByType<typeof ETxType.INVESTOR_REFUND> = {
  etoId: "0xfaDa8f267C054f469b52Ccbeb08250ACAAeE65dc",
  costUlps: Q18.mul("0.04").toString(),
  costEurUlps: Q18.mul("0.34").toString(),
  tokenName: "Fifth Force",
  tokenSymbol: "FT",
  amountEth: Q18.mul("150").toString(),
  amountEurUlps: "0",
  tokenDecimals: 18,
  companyName: "Storybook Ltd.",
};

const additionalDataNEur: TAdditionalDataByType<typeof ETxType.INVESTOR_REFUND> = {
  ...additionalData,
  amountEth: "0",
  amountEurUlps: Q18.mul("150").toString(),
};

const additionalDataNEurAndETH: TAdditionalDataByType<typeof ETxType.INVESTOR_REFUND> = {
  ...additionalData,
  amountEurUlps: Q18.mul("150").toString(),
};

storiesOf("Refund/Summary", module)
  .addDecorator(withModalBody())
  .add("only ETH", () => (
    <RefundSummaryLayout
      txData={txData}
      onAccept={() => action("CONFIRM")}
      additionalData={additionalData}
    />
  ))
  .add("only nEur", () => (
    <RefundSummaryLayout
      txData={txData}
      onAccept={() => action("CONFIRM")}
      additionalData={additionalDataNEur}
    />
  ))
  .add("both nEUR and ETH", () => (
    <RefundSummaryLayout
      txData={txData}
      onAccept={() => action("CONFIRM")}
      additionalData={additionalDataNEurAndETH}
    />
  ));
