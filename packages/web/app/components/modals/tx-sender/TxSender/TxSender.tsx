import * as cn from "classnames";
import * as React from "react";

import { actions } from "../../../../modules/actions";
import { ETxSenderState } from "../../../../modules/tx/sender/reducer";
import {
  selectTxSenderModalOpened,
  selectTxTimestamp,
} from "../../../../modules/tx/sender/selectors";
import { ETxType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { QuintessenceModal } from "../../bank-transfer-flow/QuintessenceModal";
import { Modal } from "../../Modal";
import { TxSenderBody } from "./TxSenderBody";
import { ITxSenderDispatchProps, ITxSenderStateProps, TxSenderProps } from "./types";

function isBigModal(props: TxSenderProps): boolean {
  return props.state === ETxSenderState.INIT && props.type === ETxType.INVEST;
}

const TxSenderModalSelect: React.FunctionComponent<TxSenderProps> = props => {
  if (props.type !== ETxType.NEUR_REDEEM) {
    return <TxSenderModalOuter {...props}>{props.children}</TxSenderModalOuter>;
  }

  switch (props.state) {
    case ETxSenderState.INIT:
    case ETxSenderState.SUMMARY:
    case ETxSenderState.DONE:
      return (
        <QuintessenceModal isOpen={props.isOpen} onClose={props.onCancel}>
          {props.children}
        </QuintessenceModal>
      );
    default:
      return <TxSenderModalOuter {...props}>{props.children}</TxSenderModalOuter>;
  }
};

const TxSenderModalOuter: React.FunctionComponent<TxSenderProps> = props => (
  <Modal isOpen={props.isOpen} onClose={props.onCancel} className={cn({ big: isBigModal(props) })}>
    {props.children}
  </Modal>
);

const TxSenderModalComponent: React.FunctionComponent<TxSenderProps> = props => (
  <TxSenderModalSelect {...props}>
    <TxSenderBody {...props} />
  </TxSenderModalSelect>
);

const TxSenderModal = appConnect<ITxSenderStateProps, ITxSenderDispatchProps>({
  stateToProps: state => ({
    isOpen: selectTxSenderModalOpened(state),
    state: state.txSender.state,
    type: state.txSender.type,
    txHash: state.txSender.txHash,
    blockId: state.txSender.blockId,
    error: state.txSender.error,
    txTimestamp: selectTxTimestamp(state),
  }),
  dispatchToProps: d => ({
    onCancel: () => d(actions.txSender.txSenderHideModal()),
  }),
})(TxSenderModalComponent);

export { TxSenderModal, TxSenderModalComponent };
