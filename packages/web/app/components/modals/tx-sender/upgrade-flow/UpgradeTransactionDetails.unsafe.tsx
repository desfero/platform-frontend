import { Eth } from "@neufund/design-system";
import { ENumberOutputFormat, multiplyBigNumbers } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxSenderType } from "../../../../modules/tx/types";
import { InfoList } from "../shared/InfoList";
import { InfoRow } from "../shared/InfoRow";
import { TimestampRow } from "../shared/TimestampRow";
import { TransactionDetailsComponent } from "../types";

const UpgradeTransactionDetails: TransactionDetailsComponent<ETxSenderType.UPGRADE> = ({
  txData,
  className,
  txTimestamp,
}) => (
  <InfoList className={className}>
    <InfoRow caption={<FormattedMessage id="upgrade-flow.to" />} value={txData!.to} />

    <InfoRow
      caption={<FormattedMessage id="upgrade-flow.value" />}
      value={<Eth value={txData!.value} outputFormat={ENumberOutputFormat.FULL} />}
    />

    <InfoRow
      caption={<FormattedMessage id="upgrade-flow.transaction-cost" />}
      value={
        <Eth
          value={multiplyBigNumbers([txData!.gasPrice, txData!.gas])}
          outputFormat={ENumberOutputFormat.FULL}
        />
      }
    />

    {txTimestamp && <TimestampRow timestamp={txTimestamp} />}
  </InfoList>
);

export { UpgradeTransactionDetails };
