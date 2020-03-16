import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { Money } from "../../../../shared/formatters/Money";
import { Message } from "../Message";

type TWhitelistingLimitSuspended = {
  pledgedAmount: number;
  investorsCount: number;
  isPledgedByUser: boolean;
};

export const WhitelistingSuspended: React.FunctionComponent<TWhitelistingLimitSuspended> = ({
  isPledgedByUser,
  pledgedAmount,
  investorsCount,
}) => (
  <Message
    data-test-id="eto-overview-status-whitelisting-suspended"
    title={
      isPledgedByUser ? (
        <FormattedMessage id="shared-component.eto-overview.whitelist.suspended-signed" />
      ) : (
        <FormattedMessage id="shared-component.eto-overview.whitelist.suspended" />
      )
    }
    summary={
      <FormattedMessage
        id="shared-component.eto-overview.whitelist.success.summary"
        values={{
          totalAmount: (
            <Money
              value={pledgedAmount ? pledgedAmount.toString() : undefined}
              inputFormat={ENumberInputFormat.FLOAT}
              valueType={ECurrency.EUR}
              outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
            />
          ),
          totalInvestors: investorsCount,
        }}
      />
    }
  />
);
