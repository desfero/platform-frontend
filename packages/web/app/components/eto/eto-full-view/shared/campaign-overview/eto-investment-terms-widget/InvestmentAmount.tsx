import { EAbbreviatedNumberOutputFormat, ECurrency, ENumberInputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TEtoInvestmentCalculatedValues } from "../../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { TEtoWithCompanyAndContractReadonly } from "../../../../../../modules/eto/types";
import { getEtoEurMaxTarget, getEtoEurMinTarget } from "../../../../../../modules/eto/utils";
import { Entry } from "../../../../../shared/Entry";
import { MoneyRange } from "../../../../../shared/formatters/MoneyRange";
import { Tooltip } from "../../../../../shared/tooltips/Tooltip";
import { ECustomTooltipTextPosition } from "../../../../../shared/tooltips/TooltipBase";
import { ToBeAnnounced } from "../../../../shared/ToBeAnnouncedTooltip";

type TExternalProps = {
  eto: TEtoWithCompanyAndContractReadonly;
};

type TRangeProps = {
  minTarget: string | undefined;
  maxTarget: string | undefined;
  investmentCalculatedValues: TEtoInvestmentCalculatedValues | undefined;
};

const InvestmentAmountRange: React.FunctionComponent<TRangeProps> = ({
  minTarget,
  maxTarget,
  investmentCalculatedValues,
}) => {
  const minInvestmentAmount = investmentCalculatedValues
    ? investmentCalculatedValues.minInvestmentAmount
    : undefined;
  const maxInvestmentAmount = investmentCalculatedValues
    ? investmentCalculatedValues.maxInvestmentAmount
    : undefined;

  const minTargetAmount = minTarget ? minTarget : minInvestmentAmount;
  const maxTargetAmount = maxTarget ? maxTarget : maxInvestmentAmount;

  return (
    <>
      <MoneyRange
        valueFrom={minInvestmentAmount ? minInvestmentAmount.toString() : undefined}
        valueUpto={maxInvestmentAmount ? maxInvestmentAmount.toString() : undefined}
        inputFormat={ENumberInputFormat.FLOAT}
        valueType={ECurrency.EUR}
        outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
        defaultValue={<ToBeAnnounced />}
      />
      {minTarget && (
        <Tooltip
          textPosition={ECustomTooltipTextPosition.LEFT}
          content={
            <FormattedMessage
              id="shared-component.eto-overview.investment-stats.target.tooltip"
              values={{
                lineBreak: <br />,
                target: (
                  <MoneyRange
                    valueFrom={minTargetAmount ? minTargetAmount.toString() : undefined}
                    valueUpto={maxTargetAmount ? maxTargetAmount.toString() : undefined}
                    inputFormat={ENumberInputFormat.FLOAT}
                    valueType={ECurrency.EUR}
                    outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
                  />
                ),
              }}
            />
          }
        />
      )}
    </>
  );
};

const InvestmentAmount: React.FunctionComponent<TExternalProps> = ({ eto }) => {
  const minTarget = getEtoEurMinTarget(eto);
  const maxTarget = getEtoEurMaxTarget(eto);

  return (
    <Entry
      label={<FormattedMessage id="eto.public-view.token-terms.investment-amount" />}
      value={
        <InvestmentAmountRange
          minTarget={minTarget}
          maxTarget={maxTarget}
          investmentCalculatedValues={eto.investmentCalculatedValues}
        />
      }
      data-test-id="eto-public-view-investment-amount"
    />
  );
};

export { InvestmentAmount };
