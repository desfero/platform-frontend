import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { testEto } from "../../../../../test/fixtures";
import {
  EETOStateOnChain,
  TEtoWithCompanyAndContractTypeChecked,
} from "../../../../modules/eto/types";
import {
  EInvestmentCurrency,
  EInvestmentFormState,
  EInvestmentValueType,
  EInvestmentWallet,
} from "../../../../modules/tx/user-flow/investment/types";
import { dummyIntl } from "../../../../utils/injectIntlHelpers.fixtures";
import { withModalBody } from "../../../../utils/storybookHelpers.unsafe";
import { InvestmentSelectionComponent } from "./Investment";
import { wallets } from "./InvestmentTypeSelector.stories";

const testEtoInWhitelist = {
  ...testEto,
  contract: {
    ...testEto.contract!,
    timedState: EETOStateOnChain.Whitelist,
  },
} as TEtoWithCompanyAndContractTypeChecked;

const props = {
  formState: EInvestmentFormState.VALID,

  eto: testEtoInWhitelist,
  wallets,
  investmentValue: "1234553",
  euroValueWithFallback: "223450",
  investmentWallet: EInvestmentWallet.Eth,
  investmentCurrency: EInvestmentCurrency.ETH,
  totalCostEth: "1234556",
  totalCostEuro: "223456",
  hasPreviouslyInvested: true,
  investmentValueType: EInvestmentValueType.PARTIAL_BALANCE,
  minEthTicketFormatted: "123456",

  gasCostEth: "12341234123412341234",
  gasCostEuro: "123412323412341234",
  minTicketEur: "1234",
  minTicketEth: "12344444",
  maxTicketEur: "10000000000",
  neuReward: "100",
  etoTokenGeneralDiscounts: {
    whitelistDiscountFrac: 0.35,
    whitelistDiscountUlps: "296633323000000000",
    publicDiscountFrac: 0.25,
    publicDiscountUlps: "339009512000000000",
  },
  etoTokenPersonalDiscount: {
    whitelistDiscountAmountLeft: "-1.043240344598e+23",
    whitelistDiscountUlps: "0",
    whitelistDiscountFrac: 0.5,
  },
  etoTokenStandardPrice: "0.6",
  equityTokenCountFormatted: "5000",

  submitInvestment: () => action("submitInvestment"),
  investEntireBalance: () => action("investEntireBalance"),
  changeInvestmentValue: () => action("changeInvestmentValue"),
  changeInvestmentWallet: () => action("changeInvestmentType"),
  startUpgradeFlow: () => action("startUpgradeFlow"),

  intl: dummyIntl,
} as const;

storiesOf("Investment/Form", module)
  .addDecorator(withModalBody())

  .add("default with error", () => <InvestmentSelectionComponent {...props} />);
