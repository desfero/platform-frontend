import * as React from "react";
import { compose } from "recompose";

import { actions } from "../../../modules/actions";
import { EBankTransferType } from "../../../modules/bank-transfer-flow/reducer";
import { selectIsBankAccountVerified } from "../../../modules/bank-transfer-flow/selectors";
import { selectBankAccount } from "../../../modules/kyc/selectors";
import { TBankAccount } from "../../../modules/kyc/types";
import { selectNEURStatus } from "../../../modules/wallet/selectors";
import { ENEURWalletStatus } from "../../../modules/wallet/types";
import { appConnect } from "../../../store";
import { DeepReadonly } from "../../../types";
import { onEnterAction } from "../../../utils/OnEnterAction";

interface IDispatchProps {
  verifyBankAccount: () => void;
}

interface IStateProps {
  bankAccount: DeepReadonly<TBankAccount> | undefined;
  isBankAccountVerified: boolean;
  neurStatus: ENEURWalletStatus;
}

const connectLinkBankAccountComponent = () => <T extends {}>(
  WrappedComponent: React.ComponentType<IStateProps & IDispatchProps & T>,
) =>
  compose<IStateProps & IDispatchProps & T, T>(
    onEnterAction({
      actionCreator: dispatch => {
        dispatch(actions.kyc.loadBankAccountDetails());
      },
    }),
    appConnect<IStateProps, IDispatchProps, T>({
      stateToProps: state => ({
        bankAccount: selectBankAccount(state),
        isBankAccountVerified: selectIsBankAccountVerified(state),
        neurStatus: selectNEURStatus(state),
      }),
      dispatchToProps: dispatch => ({
        verifyBankAccount: () =>
          dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.VERIFY)),
      }),
    }),
  )(WrappedComponent);

export { connectLinkBankAccountComponent };
