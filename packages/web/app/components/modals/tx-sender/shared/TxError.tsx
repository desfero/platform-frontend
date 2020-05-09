import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { externalRoutes } from "../../../../config/externalRoutes";
import { Tx } from "../../../../lib/api/users/interfaces";
import { ETxType, ITxData } from "../../../../lib/web3/types";
import { ETransactionErrorType } from "../../../../modules/tx/sender/reducer";
import {
  selectTxAdditionalData,
  selectTxDetails,
  selectTxTimestamp,
} from "../../../../modules/tx/sender/selectors";
import { TSpecificTransactionState } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { ExternalLink } from "../../../shared/links/ExternalLink";
import { Message } from "../../message/Message";
import { TxDetails } from "../TxDetails.unsafe";
import { TxName } from "../TxName";
import { TransferError } from "../withdraw-flow/Error/Error";
import { TxHashAndBlock } from "./TxHashAndBlock";

import failedImg from "../../../../assets/img/ether_fail.svg";
import * as styles from "./TxError.module.scss";

export interface IStateProps {
  txData?: Partial<ITxData>;
  additionalData?: TSpecificTransactionState["additionalData"];
  txTimestamp?: number;
}

interface IProps {
  type: ETxType;
  error?: ETransactionErrorType;
  blockId?: number;
  txHash: string;
}

const getErrorMessageByType = (type?: ETransactionErrorType) => {
  switch (type) {
    case ETransactionErrorType.NOT_ENOUGH_NEUMARKS_TO_UNLOCK:
      return (
        <FormattedMessage id="modal.txsender.error-message.error-not-enough-neu-to-unlock.message" />
      );
    case ETransactionErrorType.ERROR_WHILE_WATCHING_TX:
      return <FormattedMessage id="modal.txsender.error-message.error-while-watching-tx" />;
    case ETransactionErrorType.FAILED_TO_GENERATE_TX:
      return <FormattedMessage id="modal.txsender.error-message.failed-to-generate-tx" />;
    case ETransactionErrorType.GAS_TOO_LOW:
      return <FormattedMessage id="modal.txsender.error-message.gas-too-low" />;
    case ETransactionErrorType.INVALID_CHAIN_ID:
      return <FormattedMessage id="modal.txsender.error-message.invalid-chain-id" />;
    case ETransactionErrorType.INVALID_RLP_TX:
      return <FormattedMessage id="modal.txsender.error-message.invalid-rlp-tx" />;
    case ETransactionErrorType.NOT_ENOUGH_ETHER_FOR_GAS:
      return <FormattedMessage id="modal.txsender.error-message.not-enough-ether-for-gas" />;
    case ETransactionErrorType.NONCE_TOO_LOW:
      return <FormattedMessage id="modal.txsender.error-message.nonce-too-low" />;
    case ETransactionErrorType.NOT_ENOUGH_FUNDS:
      return <FormattedMessage id="modal.txsender.error-message.not-enough-funds" />;
    case ETransactionErrorType.OUT_OF_GAS:
      return <FormattedMessage id="modal.txsender.error-message.out-of-gas" />;
    case ETransactionErrorType.REVERTED_TX:
      return <FormattedMessage id="modal.txsender.error-message.reverted-tx" />;
    case ETransactionErrorType.TOO_MANY_TX_IN_QUEUE:
      return <FormattedMessage id="modal.txsender.error-message.too-many-tx-in-queue" />;
    case ETransactionErrorType.TX_WAS_REJECTED:
      return <FormattedMessage id="modal.txsender.error-message.tx-was-rejected" />;
    case ETransactionErrorType.LEDGER_CONTRACTS_DISABLED:
      return <FormattedMessage id="modal.txsender.error-message.ledger-contracts-disabled" />;
    default:
      return (
        <FormattedMessage
          id="modal.shared.signing-message.transaction-error.text"
          values={{
            supportDesk: (
              <ExternalLink href={externalRoutes.neufundSupportHome}>
                <FormattedMessage id="support-desk.link.text" />
              </ExternalLink>
            ),
          }}
        />
      );
  }
};

const getErrorTitleByType = (type: ETxType, error?: ETransactionErrorType) => {
  switch (error) {
    case ETransactionErrorType.NOT_ENOUGH_NEUMARKS_TO_UNLOCK:
      return (
        <FormattedMessage id="modal.txsender.error-message.error-not-enough-neu-to-unlock.title" />
      );
    default:
      return (
        <FormattedMessage
          id="modal.shared.signing-message.transaction-error.title"
          values={{ transaction: <TxName type={type} /> }}
        />
      );
  }
};

type TTxErrorLayoutProps = {
  txData?: Tx;
  error?: ETransactionErrorType;
  blockId?: number;
  txHash: string;
  txTimestamp?: number;
} & TSpecificTransactionState;

const TxErrorDefaultLayout: React.FunctionComponent<TTxErrorLayoutProps> = props => (
  <Message
    data-test-id="modals.shared.tx-error.modal"
    image={<img src={failedImg} className={cn(styles.eth, "mb-5")} alt="" />}
    title={getErrorTitleByType(props.type, props.error)}
    titleClassName="text-warning"
    text={getErrorMessageByType(props.error)}
  >
    <TxDetails className="mb-3" {...props} />

    <TxHashAndBlock txHash={props.txHash} blockId={props.blockId} />
  </Message>
);

const TxErrorLayout: React.FunctionComponent<TTxErrorLayoutProps> = props => {
  switch (props.type) {
    case ETxType.WITHDRAW:
      return (
        <TransferError txHash={props.txHash} txTimestamp={props.txTimestamp} error={props.error} />
      );
    default:
      return <TxErrorDefaultLayout {...props} />;
  }
};

const TxError = compose<TTxErrorLayoutProps, IProps>(
  appConnect<IStateProps>({
    stateToProps: state => ({
      txData: selectTxDetails(state),
      txTimestamp: selectTxTimestamp(state),
      additionalData: selectTxAdditionalData(state),
    }),
  }),
)(TxErrorLayout);

export { TxError, TxErrorLayout };
