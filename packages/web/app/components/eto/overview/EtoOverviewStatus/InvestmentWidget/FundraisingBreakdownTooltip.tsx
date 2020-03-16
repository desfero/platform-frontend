import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { Money } from "../../../../shared/formatters/Money";
import { Tooltip } from "../../../../shared/tooltips/Tooltip";
import { ECustomTooltipTextPosition } from "../../../../shared/tooltips/TooltipBase";

type TExternalProps = {
  etherTokenBalance: string;
  euroTokenBalance: string;
};

type TTooltipProps = React.ComponentProps<typeof Tooltip>;

const FundraisingBreakdownTooltip: React.FunctionComponent<TExternalProps &
  Partial<TTooltipProps>> = ({ etherTokenBalance, euroTokenBalance, ...props }) => (
  <Tooltip
    textPosition={ECustomTooltipTextPosition.LEFT}
    content={
      <>
        <FormattedMessage id="shared-component.eto-overview.fundraising-breakdown" />
        <br />
        <Money
          value={euroTokenBalance}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          valueType={ECurrency.EUR_TOKEN}
        />
        <br />
        <Money
          value={etherTokenBalance}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          valueType={ECurrency.ETH}
        />
      </>
    }
    {...props}
  />
);

export { FundraisingBreakdownTooltip };
