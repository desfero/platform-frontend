import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { ITxData } from "../../../../lib/web3/types";
import {
  selectTxAdditionalData,
  selectTxDetails,
  selectTxTimestamp,
} from "../../../../modules/tx/sender/selectors";
import { ETxSenderType, TSpecificTransactionState } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { EthereumIcon } from "../../../shared/ethereum";
import { Message } from "../../message/Message";
import { TxDetails } from "../TxDetails.unsafe";
import { TxName } from "../TxName";
import { TxGoToAction } from "./TxGoToAction";
import { TxHashAndBlock } from "./TxHashAndBlock";

export interface IStateProps {
  txData?: Partial<ITxData>;
  txTimestamp?: number;
  additionalData?: TSpecificTransactionState["additionalData"];
}

export interface IExternalProps {
  blockId?: number;
  txHash?: string;
  type: TSpecificTransactionState["type"];
}

type TTxPendingLayoutProps = {
  txData?: ITxData;
  blockId?: number;
  txHash?: string;
  txTimestamp?: number;
} & TSpecificTransactionState;

type TTxSuccessTitleProps = { type: TSpecificTransactionState["type"] };

const TxSuccessText: React.FunctionComponent<TTxSuccessTitleProps> = ({ type }) => {
  switch (type) {
    case ETxSenderType.INVESTOR_REFUND:
      return <FormattedMessage id="tx-sender.tx-success.refund-description" />;
    default:
      return (
        <FormattedMessage
          id="tx-sender.tx-success.description"
          values={{ transaction: <TxName type={type} /> }}
        />
      );
  }
};

const TxSuccessLayout: React.FunctionComponent<TTxPendingLayoutProps> = props => (
  <Message
    data-test-id="modals.shared.tx-success.modal"
    image={<EthereumIcon className="mb-3" />}
    title={
      <FormattedMessage
        id="tx-sender.tx-success.title"
        values={{ transaction: <TxName type={props.type} /> }}
      />
    }
    titleClassName="text-success"
    text={<TxSuccessText type={props.type} />}
  >
    <TxDetails className="mb-3" {...props} />

    {props.txHash && <TxHashAndBlock txHash={props.txHash} blockId={props.blockId} />}

    <TxGoToAction type={props.type} />
  </Message>
);

const TxSuccess = compose<TTxPendingLayoutProps, IExternalProps>(
  appConnect<IStateProps>({
    stateToProps: state => ({
      txData: selectTxDetails(state),
      txTimestamp: selectTxTimestamp(state),
      additionalData: selectTxAdditionalData(state),
    }),
  }),
)(TxSuccessLayout);

export { TxSuccess, TxSuccessLayout };
