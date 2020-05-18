import { ETransactionDirection } from "../../../lib/api/analytics-api/interfaces";
import * as React from "react";
import * as cn from "classnames";
import { InlineIcon } from "@neufund/design-system";
import { FormattedDate } from "react-intl";

import { TransactionData, TransactionName } from "../../shared/transaction";
import { ETheme, Money } from "../../shared/formatters/Money";
import { ECurrency, ENumberOutputFormat } from "../../shared/formatters/utils";
import { TEtoInvestmentTx, TTxHistory } from "../../../modules/tx-history/types";

import * as styles from "./TransactionsHistory.module.scss";
import transactionIcon from "../../../assets/img/inline_icons/tx_icon_placeholder.svg";
import { EInlineIconFill } from "../../shared/icons";


export type TTransactionProps = {
  showTransactionDetails: (id: string) => void;
  transaction: TTxHistory
}

export const Transaction: React.FunctionComponent<TTransactionProps> = ({ showTransactionDetails, transaction }) => {
  const isIncomeTransaction =
    transaction.transactionDirection === ETransactionDirection.IN;

  return (
    <ul className={styles.transactionListItem}
         key={transaction.id}
         onClick={() => showTransactionDetails(transaction.id)}
         data-test-id={`transactions-history-row transactions-history-${transaction.txHash.slice(
           0,
           10,
         )}`}
    >
      <div className={styles.transactionLogo}>
        <InlineIcon svgIcon={transactionIcon} fill={EInlineIconFill.FILL_OUTLINE} />
      </div>
      <div className={styles.transactionData}>
        <TransactionData
          top={<TransactionName transaction={transaction} />}
          bottom={
            <FormattedDate
              value={transaction.date}
              year="numeric"
              month="long"
              day="2-digit"
            />
          }
        />
      </div>
      <div className={styles.transactionAmount}>
                  <span className={cn(styles.amount, { [styles.amountIn]: isIncomeTransaction })}>
                  {!isIncomeTransaction && "-"}
                    <Money
                      inputFormat={transaction.amountFormat}
                      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
                      theme={isIncomeTransaction ? ETheme.GREEN : undefined}
                      value={transaction.amount}
                      valueType={transaction.currency}
                    />
                  </span>
        {(transaction as TEtoInvestmentTx).amountEur
          ? <span className={styles.euroEquivalent}>
                  {"≈"}
            <Money
              inputFormat={transaction.amountFormat}
              outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
              value={(transaction as TEtoInvestmentTx).amountEur}
              valueType={ECurrency.EUR}
            />
        </span>
          : null
        }
      </div>
    </ul>
  );
}
