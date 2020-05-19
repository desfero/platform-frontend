import { Button, EButtonLayout } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { actions } from "../../../modules/actions";
import { selectTxHistoryPaginated } from "../../../modules/tx-history/selectors";
import { selectPlatformMiningTransaction } from "../../../modules/tx/monitor/selectors";
import { appConnect } from "../../../store";
import { onEnterAction } from "../../../utils/react-connected-components/OnEnterAction";
import { onLeaveAction } from "../../../utils/react-connected-components/OnLeaveAction";
import { LoadingIndicator } from "../../shared/loading-indicator/LoadingIndicator";
import { PanelRounded } from "../../shared/Panel";
import { PendingTransaction } from "./PendingTransaction";
import { Transaction } from "./Transaction";

import * as styles from "./TransactionsHistory.module.scss";

type TStateProps = {
  transactionsHistoryPaginated: ReturnType<typeof selectTxHistoryPaginated>;
  pendingTransaction: ReturnType<typeof selectPlatformMiningTransaction>;
};

type TDispatchProps = {
  loadTxHistoryNext: () => void;
  showTransactionDetails: (id: string) => void;
};

export const NoTransactions = () => (
  <PanelRounded className={styles.noTransactions}>
    <FormattedMessage id="wallet.tx-list.no-transaction" />
  </PanelRounded>
);

export const TransactionListLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  transactionsHistoryPaginated,
  loadTxHistoryNext,
  pendingTransaction,
  showTransactionDetails,
}) => (
  <PanelRounded>
    {(transactionsHistoryPaginated.transactions || pendingTransaction) && (
      <li className={styles.transactionList} data-test-id="transactions-history">
        {pendingTransaction && (
          <PendingTransaction
            data-test-id="pending-transactions.transaction-mining"
            transaction={pendingTransaction}
          />
        )}

        {transactionsHistoryPaginated.transactions &&
          transactionsHistoryPaginated.transactions.map(transaction => (
            <Transaction
              key={transaction.id}
              transaction={transaction}
              showTransactionDetails={showTransactionDetails}
            />
          ))}
      </li>
    )}
    {transactionsHistoryPaginated.canLoadMore && (
      <Button
        data-test-id="transactions-history-load-more"
        layout={EButtonLayout.LINK}
        isLoading={transactionsHistoryPaginated.isLoading}
        onClick={loadTxHistoryNext}
      >
        <FormattedMessage id="wallet.tx-list.load-more" />
      </Button>
    )}
  </PanelRounded>
);

const TransactionsHistory = compose<TStateProps & TDispatchProps, {}>(
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
  branch<TStateProps>(
    props =>
      props.transactionsHistoryPaginated.transactions !== undefined &&
      props.transactionsHistoryPaginated.transactions.length === 0 &&
      props.pendingTransaction === null,
    renderComponent(NoTransactions),
  ),
)(TransactionListLayout);

export { TransactionsHistory };
