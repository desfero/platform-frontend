import * as cn from "classnames";
import React, { ReactNode } from "react";
import { FormattedDate } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";

import { TxPendingWithMetadata } from "../../../lib/api/users/interfaces";
import { ETxType } from "../../../modules/tx/types";
import { TDataTestId } from "../../../types";
import { Money } from "../formatters/Money";
import { ENumberOutputFormat } from "../formatters/utils";
import { TransactionData } from "./TransactionData";
import { TransactionName } from "./TransactionName";

import * as styles from "./Transaction.module.scss";

interface ITransactionWithStatusProps {
  transaction: TxPendingWithMetadata;
  icon?: ReactNode;
}

const Transaction: React.FunctionComponent<ITransactionWithStatusProps & TDataTestId> = ({
  transaction,
  "data-test-id": dataTestId,
  icon,
}) => {
  switch (transaction.transactionType) {
    case ETxType.NOMINEE_THA_SIGN:
      return (
        <section className={styles.wrapper} data-test-id={dataTestId}>
          <div className={styles.info}>
            {icon && <div className={styles.icon}>{icon}</div>}
            <FormattedMessage id="wallet.tx-list.name.nominee-sign-tha" />
          </div>
        </section>
      );
    default:
      return (
        <section className={styles.wrapper} data-test-id={dataTestId}>
          <div className={styles.info}>
            {icon && <div className={styles.icon}>{icon}</div>}
            <TransactionData
              top={<TransactionName transaction={transaction.transactionAdditionalData} />}
              bottom={
                <FormattedDate
                  value={transaction.transactionTimestamp}
                  year="numeric"
                  month="long"
                  day="2-digit"
                />
              }
            />
          </div>
          <Money
            className={cn(styles.amount)}
            decimals={transaction.transactionAdditionalData.tokenDecimals}
            inputFormat={transaction.transactionAdditionalData.amountFormat}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
            value={transaction.transactionAdditionalData.amount}
            valueType={transaction.transactionAdditionalData.currency}
          />
        </section>
      );
  }
};

export { Transaction };
