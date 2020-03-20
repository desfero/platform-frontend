import { storiesOf } from "@storybook/react";
import * as React from "react";

import { testContract, testEto } from "../../../../../../test/fixtures";
import {
  TEtoWithCompanyAndContract,
  TEtoWithCompanyAndContractReadonly,
} from "../../../../../modules/eto/types";
import { EInvestmentStatusSize, InvestmentStatusWidget } from "./InvestmentStatusWidget";

const eto: TEtoWithCompanyAndContractReadonly = {
  ...testEto,
  contract: {
    ...testContract,
    totalInvestment: {
      ...testContract.totalInvestment,
      totalTokensInt: (
        testEto.minimumNewSharesToIssue *
        testEto.equityTokensPerShare *
        0.5
      ).toString(),
    },
  },
};

const etoSuccessFull: TEtoWithCompanyAndContract = {
  ...eto,
  contract: {
    ...testContract,
    totalInvestment: {
      ...testContract.totalInvestment,
      totalInvestors: "123",
      totalTokensInt: (testEto.minimumNewSharesToIssue * testEto.equityTokensPerShare).toString(),
    },
  },
};

const etoSuccessFullOver: TEtoWithCompanyAndContract = {
  ...eto,
  contract: {
    ...testContract,
    totalInvestment: {
      ...testContract.totalInvestment,
      totalInvestors: "12345",
      totalTokensInt: (
        testEto.minimumNewSharesToIssue *
        testEto.equityTokensPerShare *
        1.7
      ).toString(),
    },
  },
};

storiesOf("InvestmentStats", module)
  .add("default", () => <InvestmentStatusWidget eto={eto} />)
  .add("reached", () => <InvestmentStatusWidget eto={etoSuccessFull} />)
  .add("over", () => <InvestmentStatusWidget eto={etoSuccessFullOver} />)
  .add("small widget", () => (
    <InvestmentStatusWidget eto={eto} size={EInvestmentStatusSize.SMALL} />
  ));
