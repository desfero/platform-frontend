import { ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxSenderType } from "../../../../modules/tx/types";
import { Money } from "../../../shared/formatters/Money";
import { InfoList } from "../shared/InfoList";
import { InfoRow } from "../shared/InfoRow";
import { TimestampRow } from "../shared/TimestampRow";
import { TransactionDetailsComponent } from "../types";

const RedistributeTransactionDetails: TransactionDetailsComponent<ETxSenderType.INVESTOR_REDISTRIBUTE_PAYOUT> = ({
  additionalData,
  className,
  txTimestamp,
}) => {
  const tokenDisbursal = additionalData.tokenDisbursals;

  return (
    <InfoList className={className}>
      <InfoRow
        key={tokenDisbursal.token}
        caption={<FormattedMessage id="investor-payout.redistribute.summary.total-redistributed" />}
        value={
          <Money
            value={tokenDisbursal.amountToBeClaimed}
            inputFormat={ENumberInputFormat.ULPS}
            outputFormat={ENumberOutputFormat.FULL}
            valueType={tokenDisbursal.token}
          />
        }
      />
      {txTimestamp && <TimestampRow timestamp={txTimestamp} />}
    </InfoList>
  );
};

export { RedistributeTransactionDetails };
