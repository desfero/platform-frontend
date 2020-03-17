import { Eur } from "@neufund/design-system";
import { ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";


import * as styles from "./WhitelistStatus.module.scss";

export interface IInvestmentWidgetProps {
  investorsCount: number;
  investorsLimit: number;
  pledgedAmount: number | null;
}

const WhitelistStatus: React.FunctionComponent<IInvestmentWidgetProps> = ({
  investorsCount,
  investorsLimit,
  pledgedAmount,
}) => (
  <div className={styles.investmentWidget}>
    <div className={styles.header}>
      <div>
        <FormattedMessage
          id="eto-overview-thumbnail.whitelist.amount-signed-up"
          values={{
            amount: (
              <Eur
                value={pledgedAmount ? pledgedAmount.toString() : "0"}
                inputFormat={ENumberInputFormat.FLOAT}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
              />
            ),
          }}
        />
      </div>
      <div>
        <FormattedMessage
          id="eto-overview-thumbnail.whitelist.slots-left"
          values={{
            left: (
              <span data-test-id="eto-bookbuilding-remaining-slots">
                {investorsLimit - investorsCount}
              </span>
            ),
            limit: investorsLimit,
          }}
        />
      </div>
    </div>
  </div>
);

export { WhitelistStatus };
