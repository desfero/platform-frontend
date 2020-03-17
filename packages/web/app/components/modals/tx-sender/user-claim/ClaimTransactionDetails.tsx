import { Eth, Neu } from "@neufund/design-system";
import { ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxSenderType } from "../../../../modules/tx/types";
import { InfoList } from "../shared/InfoList";
import { InfoRow } from "../shared/InfoRow";
import { TimestampRow } from "../shared/TimestampRow";
import { TransactionDetailsComponent } from "../types";

const ClaimTransactionDetails: TransactionDetailsComponent<ETxSenderType.USER_CLAIM> = ({
  txTimestamp,
  additionalData,
  className,
  children,
}) => (
  <InfoList className={className}>
    <InfoRow
      caption={<FormattedMessage id="user-claim-flow.token-name" />}
      value={additionalData.tokenName}
    />

    <InfoRow
      caption={<FormattedMessage id="user-claim-flow.balance" />}
      value={additionalData.tokenQuantity}
    />

    <InfoRow
      caption={<FormattedMessage id="user-claim-flow.estimated-reward" />}
      value={<Neu value={additionalData.neuRewardUlps} outputFormat={ENumberOutputFormat.FULL} />}
    />

    <InfoRow
      caption={<FormattedMessage id="upgrade-flow.transaction-cost" />}
      value={<Eth value={additionalData.costUlps} outputFormat={ENumberOutputFormat.FULL} />}
    />

    {children}

    {txTimestamp && <TimestampRow timestamp={txTimestamp} />}
  </InfoList>
);

export { ClaimTransactionDetails };
