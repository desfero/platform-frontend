import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxType } from "../../../../modules/tx/types";
import { Money } from "../../../shared/formatters/Money";
import {
  ENumberInputFormat,
  ENumberOutputFormat,
  selectUnits,
} from "../../../shared/formatters/utils";
import { InfoList } from "../shared/InfoList";
import { InfoRow } from "../shared/InfoRow";
import { TimestampRow } from "../shared/TimestampRow";
import { TransactionDetailsComponent } from "../types";

const AcceptTransactionDetails: TransactionDetailsComponent<ETxType.INVESTOR_ACCEPT_PAYOUT> = ({
  additionalData,
  className,
  txTimestamp,
}) => (
  <InfoList className={className}>
    {additionalData.tokensDisbursals.map(disbursal => (
      <InfoRow
        data-test-id={`investor-payout.accept-summary.${disbursal.token}-total-payout`}
        key={disbursal.token}
        caption={
          <FormattedMessage
            id="investor-payout.accept.summary.total-payout"
            values={{ token: selectUnits(disbursal.token) }}
          />
        }
        value={
          <Money
            value={disbursal.amountToBeClaimed}
            valueType={disbursal.token}
            inputFormat={ENumberInputFormat.ULPS}
            outputFormat={ENumberOutputFormat.FULL}
          />
        }
      />
    ))}
    {txTimestamp && <TimestampRow timestamp={txTimestamp} />}
  </InfoList>
);

export { AcceptTransactionDetails };
