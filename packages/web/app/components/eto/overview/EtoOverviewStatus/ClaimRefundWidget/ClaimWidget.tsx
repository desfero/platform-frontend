import { Button } from "@neufund/design-system";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { Money } from "../../../../shared/formatters/Money";
import { SuccessMessage } from "../Message";
import { withCanClaimToken } from "./withCanClaimToken";

interface IExternalProps {
  tokenName: string;
  totalInvestors: string | undefined;
  totalEquivEurUlps: string;
  canClaimToken: boolean;
  etoId: string;
  onClaim: (etoId: string) => void;
}

const ClaimWidgetLayout: React.FunctionComponent<IExternalProps> = ({
  tokenName,
  totalInvestors,
  totalEquivEurUlps,
  canClaimToken,
  etoId,
  onClaim,
}) => (
  <>
    <SuccessMessage
      title={<FormattedMessage id="shared-component.eto-overview.success" />}
      summary={
        process.env.NF_MAY_SHOW_INVESTOR_STATS === "1" ? (
          <FormattedMessage
            id="shared-component.eto-overview.success.summary"
            values={{
              totalAmount: (
                <Money
                  value={totalEquivEurUlps}
                  inputFormat={ENumberInputFormat.ULPS}
                  valueType={ECurrency.EUR}
                  outputFormat={ENumberOutputFormat.FULL}
                />
              ),
              totalInvestors,
            }}
          />
        ) : (
          <FormattedMessage
            id="shared-component.eto-overview.success.summary-no-investors-count"
            values={{
              totalAmount: (
                <Money
                  value={totalEquivEurUlps}
                  inputFormat={ENumberInputFormat.ULPS}
                  valueType={ECurrency.EUR}
                  outputFormat={ENumberOutputFormat.FULL}
                />
              ),
            }}
          />
        )
      }
    />
    {canClaimToken && (
      <Button
        onClick={() => {
          onClaim(etoId);
        }}
      >
        <FormattedMessage
          id="shared-component.eto-overview.claim-your-token"
          values={{ tokenName }}
        />
      </Button>
    )}
  </>
);

export const ClaimWidget = withCanClaimToken(ClaimWidgetLayout);
