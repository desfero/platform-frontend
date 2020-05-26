import { ETransactionStatus } from "@neufund/shared-modules";
import { assertNever } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedDate, FormattedRelative } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";

import { DataRow, DataRowSeparator } from "../../../shared/DataRow";
import { ESize, TransactionData } from "../../../shared/transaction/TransactionData";

interface IExternalProps {
  date: string;
  status?: ETransactionStatus;
}

const TransactionStatus: React.FunctionComponent<{ status: ETransactionStatus }> = ({ status }) => {
  switch (status) {
    case ETransactionStatus.COMPLETED:
      return <FormattedMessage id="wallet.tx-list.modal.common.status.complete" />;
    case ETransactionStatus.PENDING:
      return <FormattedMessage id="wallet.tx-list.modal.common.status.pending" />;
    default:
      return assertNever(status, "Unsupported eto investment transaction subtype");
  }
};

const BasicTransactionDetails: React.FunctionComponent<IExternalProps> = ({
  date,
  status = ETransactionStatus.COMPLETED,
}) => (
  <>
    <DataRow
      className="mt-4"
      caption={<FormattedMessage id="wallet.tx-list.modal.common.status.caption" />}
      value={<TransactionStatus status={status} />}
    />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.common.time.caption" />}
      value={
        <TransactionData
          top={<FormattedRelative value={date} initialNow={new Date()} />}
          bottom={
            <FormattedDate
              value={date}
              timeZone="UTC"
              timeZoneName="short"
              year="numeric"
              month="short"
              day="numeric"
              hour="numeric"
              minute="numeric"
            />
          }
          size={ESize.MEDIUM}
        />
      }
    />

    <DataRowSeparator />
  </>
);

export { BasicTransactionDetails };
