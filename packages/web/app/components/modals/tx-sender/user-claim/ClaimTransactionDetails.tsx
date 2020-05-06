import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxType } from "../../../../modules/tx/types";
import { Money } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../shared/formatters/utils";
import { InfoList } from "../shared/InfoList";
import { InfoRow } from "../shared/InfoRow";
import { TimestampRow } from "../shared/TimestampRow";
import { TransactionDetailsComponent } from "../types";

const ClaimTransactionDetails: TransactionDetailsComponent<ETxType.USER_CLAIM> = ({
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
      value={
        <Money
          value={additionalData.neuRewardUlps}
          valueType={ECurrency.NEU}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.FULL}
        />
      }
    />

    <InfoRow
      caption={<FormattedMessage id="upgrade-flow.transaction-cost" />}
      value={
        <Money
          value={additionalData.costUlps}
          valueType={ECurrency.ETH}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.FULL}
        />
      }
    />

    {children}

    {txTimestamp && <TimestampRow timestamp={txTimestamp} />}
  </InfoList>
);

export { ClaimTransactionDetails };
