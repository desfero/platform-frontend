import { ButtonBase } from "@neufund/design-system";
import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { TxPendingWithMetadata } from "../../../lib/api/users-tx/interfaces";
import { actions } from "../../../modules/actions";
import { selectPlatformPendingTransaction } from "../../../modules/tx/monitor/selectors";
import { ETxSenderState } from "../../../modules/tx/sender/reducer";
import { appConnect } from "../../../store";
import { TooltipBase } from "../../shared/tooltips";

import txError from "../../../assets/img/icon_txn_status_error.svg";
import txNoPending from "../../../assets/img/icon_txn_status_no_pending.svg";
import txPending from "../../../assets/img/icon_txn_status_pending_transaction.svg";
import txSuccess from "../../../assets/img/icon_txn_status_success.svg";
import * as styles from "./PendingTransactionStatus.module.scss";

interface IStateProps {
  pendingTransaction?: Pick<TxPendingWithMetadata, "transactionStatus">;
}

interface IDispatchProps {
  monitorPendingTransaction: () => void;
}

interface IExternalProps {
  className: string;
}

interface IComponentProps {
  pendingTransaction: Pick<TxPendingWithMetadata, "transactionStatus">;
  monitorPendingTransaction: () => void;
  className: string;
}

const NoPendingTransactionImage = () => <img src={txNoPending} className={styles.icon} alt="" />;
const PendingTransactionImage = () => (
  <img src={txPending} className={cn(styles.icon, styles.pendingTransaction)} alt="" />
);
const TransactionErrorImage = () => <img src={txError} className={styles.icon} alt="" />;
const TransactionSuccessImage = () => <img src={txSuccess} className={styles.icon} alt="" />;

export const PendingTransactionStatusLayout: React.FunctionComponent<IComponentProps> = ({
  pendingTransaction,
  monitorPendingTransaction,
  className,
}) => {
  switch (pendingTransaction.transactionStatus) {
    case ETxSenderState.MINING:
      return (
        <>
          <ButtonBase
            data-test-id="pending-transactions-status.mining"
            onClick={monitorPendingTransaction}
            className={className}
          >
            <PendingTransactionImage />
          </ButtonBase>
        </>
      );

    case ETxSenderState.DONE:
      return (
        <ButtonBase
          data-test-id="pending-transactions-status.success"
          onClick={monitorPendingTransaction}
          className={className}
        >
          <TransactionSuccessImage />
        </ButtonBase>
      );

    case ETxSenderState.ERROR_SIGN:
      return (
        <ButtonBase
          data-test-id="pending-transactions-status.error"
          onClick={monitorPendingTransaction}
          className={className}
        >
          <TransactionErrorImage />
        </ButtonBase>
      );

    default:
      throw new Error(
        `Unsupported pending transaction status: ${pendingTransaction.transactionStatus}`,
      );
  }
};

export const NoPendingTransaction: React.FunctionComponent<IExternalProps> = ({ className }) => (
  <>
    <div
      className={className}
      id="no-pending-transactions"
      data-test-id="pending-transactions-status.no-pending-transactions"
    >
      <NoPendingTransactionImage />
    </div>

    <TooltipBase target="no-pending-transactions" hideArrow={true}>
      <p className="mb-0">
        <FormattedMessage id="pending-transaction-status.no-pending-transactions.tooltip" />
      </p>
    </TooltipBase>
  </>
);

const PendingTransactionStatus = compose<IComponentProps, IExternalProps>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      pendingTransaction: selectPlatformPendingTransaction(s),
    }),
    dispatchToProps: dispatch => ({
      monitorPendingTransaction: () => {
        dispatch(actions.txMonitor.monitorPendingPlatformTx());
      },
    }),
  }),
  branch<IStateProps>(
    props => !props.pendingTransaction || !props.pendingTransaction.transactionStatus,
    renderComponent(NoPendingTransaction),
  ),
)(PendingTransactionStatusLayout);

export { PendingTransactionStatus, PendingTransactionImage };
