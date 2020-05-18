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

// const pendingTransactionGeneral = { //fixme
//   transaction: {
//     from: "0xA622f39780fC8722243b49ACF3bFFEEb9B9201F2",
//     gas: "0x15dc0",
//     gasPrice: "0x3a1d51c00",
//     hash: "0xd5cd84e84ced9eccc8f80cd4e5b1d40e8cb42a76d9b0dfb9d575bb389c42fad8",
//     input: "0x64663ea60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016345785d8a0000",
//     nonce: "0x0",
//     to: "0x8843fd9a6e5078ab538dd49f6e106e822508225a",
//     value: "0x0"
//   },
//   transactionType: "WITHDRAW",
//   "transactionAdditionalData": {
//     "to": "0x0000000000000000000000000000000000000000",
//     "amount": "100000000000000000",
//     "total": "101396761600000000",
//     "totalEur": "19470473800366460490.458112",
//     "tokenSymbol": "eth",
//     "tokenImage": "/images/1b0f8ccf.svg",
//     "tokenDecimals": 18,
//     "currency": "eth",
//     "subType": "pending",
//     "transactionDirection": "out",
//     "amountFormat": "ulps",
//     "type": "transfer"
//   },
//   "transactionStatus": "MINING",
//   "transactionTimestamp": 1589738946289,
// } as TxPendingWithMetadata
//
// const pendingTransactionThaSigning = {
//     transactionType: ETxSenderType.NOMINEE_THA_SIGN,
//   transaction: {
//   },
// } as TxPendingWithMetadata


const TransactionListLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  transactionsHistoryPaginated,
  loadTxHistoryNext,
  pendingTransaction,
  showTransactionDetails
}) => (
  <PanelRounded>

    {transactionsHistoryPaginated.transactions && (
      <li className={styles.transactionList}>
        {pendingTransaction && (
          <PendingTransaction
            data-test-id="pending-transactions.transaction-mining"
            transaction={pendingTransaction}
          />
        )}

        {transactionsHistoryPaginated.transactions.map(transaction =>
        <Transaction
          transaction={transaction}
          showTransactionDetails={showTransactionDetails}
        />
        )}
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
)(TransactionListLayout);

export { TransactionsHistory };
