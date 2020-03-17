import { Eth, Eur } from "@neufund/design-system";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat, isZero } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxSenderType } from "../../../../modules/tx/types";
import { Money } from "../../../shared/formatters/Money";
import { InfoList } from "../shared/InfoList";
import { InfoRow } from "../shared/InfoRow";
import { TimestampRow } from "../shared/TimestampRow";
import { TransactionDetailsComponent } from "../types";

const RefundTransactionDetails: TransactionDetailsComponent<ETxSenderType.INVESTOR_REFUND> = ({
  txTimestamp,
  additionalData,
  className,
}) => (
  <InfoList className={className}>
    <InfoRow
      caption={<FormattedMessage id="user-refund-flow.token-name" />}
      value={`${additionalData.tokenName} (${additionalData.tokenSymbol})`}
    />

    {!isZero(additionalData.amountEurUlps) && (
      <InfoRow
        caption={<FormattedMessage id="user-refund-flow.amount.neur" />}
        value={
          <Money
            data-test-id="modals.tx-sender.user-refund-flow.amount.neur"
            value={additionalData.amountEurUlps}
            valueType={ECurrency.EUR_TOKEN}
            inputFormat={ENumberInputFormat.ULPS}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          />
        }
      />
    )}

    {!isZero(additionalData.amountEth) && (
      <InfoRow
        caption={<FormattedMessage id="user-refund-flow.amount.eth" />}
        value={
          <Eth
            data-test-id="modals.tx-sender.user-refund-flow.amount.eth"
            value={additionalData.amountEth}
          />
        }
      />
    )}

    {/* Show only when transaction is not signed yet */}
    {!txTimestamp && (
      <InfoRow
        caption={<FormattedMessage id="user-refund-flow.cost" />}
        value={
          <>
            <Eur
              value={additionalData.costEurUlps}
            />
            {" ≈ "}
            <Eth value={additionalData.costUlps} outputFormat={ENumberOutputFormat.FULL} />
          </>
        }
      />
    )}
    {txTimestamp && <TimestampRow timestamp={txTimestamp} />}
  </InfoList>
);

export { RefundTransactionDetails };
