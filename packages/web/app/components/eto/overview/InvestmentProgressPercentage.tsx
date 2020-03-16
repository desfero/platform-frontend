import {
  ENumberFormat,
  ENumberInputFormat,
  ENumberOutputFormat,
  nonNullable,
} from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TEtoWithCompanyAndContractReadonly } from "../../../modules/eto/types";
import { getInvestmentCalculatedPercentage } from "../../../modules/eto/utils";
import { Money } from "../../shared/formatters/Money";

type TExternalProps = {
  eto: TEtoWithCompanyAndContractReadonly;
};

const InvestmentProgressPercentage: React.FunctionComponent<TExternalProps> = ({ eto }) => {
  const currentInvestmentProgressPercentage = nonNullable(getInvestmentCalculatedPercentage(eto));
  return (
    <FormattedMessage
      id="shared-component.eto-overview.investment-stats.funded-percentage"
      values={{
        funded: (
          <Money
            data-test-id="investment-widget-funded-percentage"
            value={currentInvestmentProgressPercentage}
            inputFormat={ENumberInputFormat.FLOAT}
            outputFormat={ENumberOutputFormat.FULL}
            valueType={ENumberFormat.PERCENTAGE}
          />
        ),
      }}
    />
  );
};

export { InvestmentProgressPercentage };
