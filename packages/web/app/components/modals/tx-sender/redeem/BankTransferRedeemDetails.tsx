import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxType } from "../../../../modules/tx/types";
import { Money } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../shared/formatters/utils";
import { BankNumber } from "../../../wallet/BankAccount";
import { InfoList } from "../shared/InfoList";
import { InfoRow } from "../shared/InfoRow";
import { TimestampRow } from "../shared/TimestampRow";
import { TransactionDetailsComponent } from "../types";
import { CalculatedFee } from "./CalculatedFee";
import { TotalRedeemed } from "./TotalRedeemed";

const BankTransferRedeemDetails: TransactionDetailsComponent<ETxType.NEUR_REDEEM> = ({
  additionalData,
  className,
  txTimestamp,
}) => (
  <InfoList className={className}>
    <InfoRow
      caption={<FormattedMessage id="bank-transfer.redeem.summary.to-bank-account" />}
      value={
        <BankNumber
          last4={additionalData.bankAccount.accountNumberLast4}
          bank={additionalData.bankAccount.bankName}
        />
      }
    />
    <InfoRow
      caption={<FormattedMessage id="bank-transfer.redeem.summary.return-amount" />}
      value={
        <Money
          inputFormat={ENumberInputFormat.FLOAT}
          value={additionalData.amount}
          valueType={ECurrency.EUR}
          outputFormat={ENumberOutputFormat.FULL}
          data-test-id={"bank-transfer.redeem-summary.return-amount"}
        />
      }
    />
    <InfoRow
      caption={<FormattedMessage id="bank-transfer.redeem.summary.bank-fee" />}
      value={<CalculatedFee bankFee={additionalData.bankFee} amount={additionalData.amount} />}
    />
    <InfoRow
      caption={<FormattedMessage id="bank-transfer.redeem.summary.total-return-amount" />}
      value={<TotalRedeemed bankFee={additionalData.bankFee} amount={additionalData.amount} />}
    />

    {txTimestamp && <TimestampRow timestamp={txTimestamp} />}
  </InfoList>
);

export { BankTransferRedeemDetails };
