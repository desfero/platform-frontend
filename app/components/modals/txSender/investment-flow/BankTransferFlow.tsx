import * as cn from "classnames";
import * as React from "react";
import { Modal } from "reactstrap";

import { actions } from "../../../../modules/actions";
import { EBankTransferFlowState } from "../../../../modules/investmentFlow/reducer";
import { selectIsBankTransferModalOpened } from "../../../../modules/investmentFlow/selectors";
import { appConnect } from "../../../../store";
import { ModalComponentBody } from "../../ModalComponentBody";
import { BankTransferDetails } from "./BankTransferDetails";
import { BankTransferSummary } from "./BankTransferSummary";

interface IStateProps {
  isOpen: boolean;
  state?: EBankTransferFlowState
}

interface IDispatchProps {
  onCancel: () => any;
}

type Props = IStateProps & IDispatchProps;

const BankTransferFlowModalComponent: React.SFC<Props> = props => {
  const { isOpen, onCancel } = props;

  return (
    <Modal isOpen={isOpen} toggle={onCancel}>
      <ModalComponentBody onClose={onCancel}>{renderBody(props)}</ModalComponentBody>
    </Modal>
  );
};

function renderBody({ state }: Props): React.ReactNode {
  switch (state) {
    case EBankTransferFlowState.Details:
      return <BankTransferDetails />;
    case EBankTransferFlowState.Summary:
      return <BankTransferSummary />;
  }
}

const BankTransferFlowModal = appConnect<IStateProps, IDispatchProps>({
  stateToProps: state => ({
    isOpen: selectIsBankTransferModalOpened(state.investmentFlow),
    state: state.investmentFlow.bankTransferFlow,
  }),
  dispatchToProps: d => ({
    onCancel: () => d(actions.investmentFlow.resetInvestment()),
  }),
})(BankTransferFlowModalComponent);

export {BankTransferFlowModal, BankTransferFlowModalComponent}
