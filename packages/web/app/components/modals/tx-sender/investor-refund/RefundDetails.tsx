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
          <Money
            data-test-id="modals.tx-sender.user-refund-flow.amount.eth"
            value={additionalData.amountEth}
            valueType={ECurrency.ETH}
            inputFormat={ENumberInputFormat.ULPS}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
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
            <Money
              value={additionalData.costEurUlps}
              valueType={ECurrency.EUR}
              inputFormat={ENumberInputFormat.ULPS}
              outputFormat={ENumberOutputFormat.FULL}
            />
            {" ≈ "}
            <Money
              value={additionalData.costUlps}
              valueType={ECurrency.ETH}
              inputFormat={ENumberInputFormat.ULPS}
              outputFormat={ENumberOutputFormat.FULL}
            />
          </>
        }
      />
    )}
    {txTimestamp && <TimestampRow timestamp={txTimestamp} />}
  </InfoList>
);

export { RefundTransactionDetails };
