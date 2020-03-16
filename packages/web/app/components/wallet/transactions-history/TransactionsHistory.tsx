import { Button, EButtonLayout } from "@neufund/design-system";
import { ENumberOutputFormat } from "@neufund/shared";
import * as cn from "classnames";
import * as React from "react";
import { FormattedDate } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { ETransactionDirection } from "../../../lib/api/analytics-api/interfaces";
import { actions } from "../../../modules/actions";
import { selectTxHistoryPaginated } from "../../../modules/tx-history/selectors";
import { selectPlatformMiningTransaction } from "../../../modules/tx/monitor/selectors";
import { appConnect } from "../../../store";
import { onEnterAction } from "../../../utils/react-connected-components/OnEnterAction";
import { onLeaveAction } from "../../../utils/react-connected-components/OnLeaveAction";
import { PendingTransactionImage } from "../../layouts/header/PendingTransactionStatus";
import { ETheme, Money } from "../../shared/formatters/Money";
import { Heading } from "../../shared/Heading";
import { LoadingIndicator } from "../../shared/loading-indicator/LoadingIndicator";
import { Panel } from "../../shared/Panel";
import { ENewTableTheme, NewTableRow, Table } from "../../shared/table";
import { Transaction, TransactionData, TransactionName } from "../../shared/transaction";

import * as styles from "./TransactionsHistory.module.scss";

type TStateProps = {
  transactionsHistoryPaginated: ReturnType<typeof selectTxHistoryPaginated>;
  pendingTransaction: ReturnType<typeof selectPlatformMiningTransaction>;
};

type TDispatchProps = {
  loadTxHistoryNext: () => void;
  showTransactionDetails: (id: string) => void;
};

const TransactionListLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  transactionsHistoryPaginated,
  loadTxHistoryNext,
  showTransactionDetails,
  pendingTransaction,
}) => (
  <Panel>
    {pendingTransaction && (
      <div className={styles.pendingTransactionWrapper}>
        <Transaction
          data-test-id="pending-transactions.transaction-mining"
          icon={<PendingTransactionImage />}
          transaction={pendingTransaction}
        />
      </div>
    )}
    {transactionsHistoryPaginated.transactions && (
      <div className={styles.wrapper}>
        <Table
          aria-describedby="transactions-history-heading"
          titles={[
            <FormattedMessage id="wallet.tx-list.transaction" />,
            <FormattedMessage id="wallet.tx-list.amount" />,
          ]}
          titlesVisuallyHidden={true}
          placeholder={<FormattedMessage id="wallet.tx-list.placeholder" />}
          theme={ENewTableTheme.NORMAL}
        >
          {transactionsHistoryPaginated.transactions.map(transaction => {
            const isIncomeTransaction =
              transaction.transactionDirection === ETransactionDirection.IN;

            return (
              <NewTableRow
                key={transaction.id}
                onClick={() => showTransactionDetails(transaction.id)}
                data-test-id={`transactions-history-row transactions-history-${transaction.txHash.slice(
                  0,
                  10,
                )}`}
              >
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
                <>
                  {!isIncomeTransaction && "-"}
                  <Money
                    className={cn(styles.amount, { [styles.amountIn]: isIncomeTransaction })}
                    inputFormat={transaction.amountFormat}
                    outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
                    theme={isIncomeTransaction ? ETheme.GREEN : undefined}
                    value={transaction.amount}
                    valueType={transaction.currency}
                  />
                </>
              </NewTableRow>
            );
          })}
        </Table>
      </div>
    )}
    {transactionsHistoryPaginated.canLoadMore && (
      <Button
        data-test-id="transactions-history-load-more"
        layout={EButtonLayout.GHOST}
        isLoading={transactionsHistoryPaginated.isLoading}
        onClick={loadTxHistoryNext}
      >
        <FormattedMessage id="wallet.tx-list.load-more" />
      </Button>
    )}
  </Panel>
);

const TransactionsList = compose<TStateProps & TDispatchProps, {}>(
  onEnterAction({
    actionCreator: dispatch => {
      dispatch(actions.txHistory.loadTransactions());
    },
  }),
  onLeaveAction({
    actionCreator: dispatch => {
      dispatch(actions.txHistory.stopWatchingForNewTransactions());
    },
  }),
  appConnect<TStateProps, TDispatchProps>({
    stateToProps: state => ({
      transactionsHistoryPaginated: selectTxHistoryPaginated(state),
      pendingTransaction: selectPlatformMiningTransaction(state),
    }),
    dispatchToProps: dispatch => ({
      loadTxHistoryNext: () => dispatch(actions.txHistory.loadNextTransactions()),
      showTransactionDetails: (id: string) =>
        dispatch(actions.txHistory.showTransactionDetails(id)),
    }),
  }),
  branch<TStateProps>(
    props =>
      props.transactionsHistoryPaginated.transactions === undefined &&
      props.transactionsHistoryPaginated.isLoading,
    renderComponent(LoadingIndicator),
  ),
)(TransactionListLayout);

const TransactionsHistory: React.FunctionComponent = () => (
  <>
    <Heading id="transactions-history-heading" level={2} decorator={false}>
      <FormattedMessage id="wallet.tx-list.heading" />
    </Heading>

    <TransactionsList />
  </>
);

export { TransactionsHistory };
