import { Eur } from "@neufund/design-system";
import { ENumberInputFormat, nonNullable } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TEtoWithCompanyAndContractReadonly } from "../../../../../modules/eto/types";
import { getEtoEurMinTarget } from "../../../../../modules/eto/utils";
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
              <Eur
                data-test-id="investment-widget-nEur-target"
                value={target ? target : minInvestmentAmount.toString()}
                inputFormat={ENumberInputFormat.FLOAT}
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
                    <Eur
                      data-test-id="investment-widget-nEur-original-target"
                      value={minInvestmentAmount.toString()}
                      inputFormat={ENumberInputFormat.FLOAT}
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
