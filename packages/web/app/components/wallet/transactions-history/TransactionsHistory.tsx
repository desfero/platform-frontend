import { Button, EButtonLayout, InlineIcon } from "@neufund/design-system";
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
import { ENumberOutputFormat } from "../../shared/formatters/utils";
import { LoadingIndicator } from "../../shared/loading-indicator/LoadingIndicator";
import { PanelRounded } from "../../shared/Panel";
import { Transaction, TransactionData, TransactionName } from "../../shared/transaction";

import transactionIcon from "../../../assets/img/inline_icons/upload.svg"
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
  <PanelRounded>
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
      <div className={styles.transactionList}>
        {transactionsHistoryPaginated.transactions.map(transaction => {
          const isIncomeTransaction =
            transaction.transactionDirection === ETransactionDirection.IN;

          return (
            <div className={styles.transactionListItem}
                 key={transaction.id}
                 onClick={() => showTransactionDetails(transaction.id)}
                 data-test-id={`transactions-history-row transactions-history-${transaction.txHash.slice(
                   0,
                   10,
                 )}`}
            >
              <div className={styles.transactionLogo}>
                <InlineIcon svgIcon={transactionIcon} />
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
                <span className={styles.euroEquivalent}>
                  {"≈"}
                  <Money
                    inputFormat={transaction.amountFormat}
                    outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
                    value={transaction.amount}
                    valueType={transaction.currency}
                  />
                  </span>
              </div>
            </div>
          );
        })}
      </div>
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
)(TransactionListLayout);

export { TransactionsHistory };
