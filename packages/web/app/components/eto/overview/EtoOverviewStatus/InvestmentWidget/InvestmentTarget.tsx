import { ECurrency, ENumberInputFormat, ENumberOutputFormat, nonNullable } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TEtoWithCompanyAndContractReadonly } from "../../../../../modules/eto/types";
import { getEtoEurMinTarget } from "../../../../../modules/eto/utils";
import { Money } from "../../../../shared/formatters/Money";
import { Tooltip } from "../../../../shared/tooltips/Tooltip";
import { ECustomTooltipTextPosition } from "../../../../shared/tooltips/TooltipBase";

type TExternalProps = {
  eto: TEtoWithCompanyAndContractReadonly;
};

const InvestmentTarget: React.FunctionComponent<TExternalProps> = ({ eto }) => {
  const target = getEtoEurMinTarget(eto);
  const { investmentCalculatedValues } = eto;
  const { minInvestmentAmount } = nonNullable(investmentCalculatedValues);

  return (
    <>
      <span>
        <FormattedMessage
          id="shared-component.eto-overview.investment-stats.target"
          values={{
            amountRaised: (
              <Money
                data-test-id="investment-widget-nEur-target"
                value={target ? target : minInvestmentAmount.toString()}
                inputFormat={ENumberInputFormat.FLOAT}
                valueType={ECurrency.EUR}
                outputFormat={ENumberOutputFormat.FULL}
              />
            ),
          }}
        />
        {target && (
          <Tooltip
            textPosition={ECustomTooltipTextPosition.LEFT}
            content={
              <FormattedMessage
                id="shared-component.eto-overview.investment-stats.target.tooltip"
                values={{
                  lineBreak: <br />,
                  target: (
                    <Money
                      data-test-id="investment-widget-nEur-original-target"
                      value={minInvestmentAmount.toString()}
                      inputFormat={ENumberInputFormat.FLOAT}
                      valueType={ECurrency.EUR}
                      outputFormat={ENumberOutputFormat.FULL}
                    />
                  ),
                }}
              />
            }
          />
        )}
      </span>
    </>
  );
};

export { InvestmentTarget };
