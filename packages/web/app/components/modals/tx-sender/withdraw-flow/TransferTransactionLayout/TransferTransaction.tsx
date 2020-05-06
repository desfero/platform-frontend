import { RequiredByKeys } from "@neufund/shared-utils";
import { branch, compose } from "recompose";

import { actions } from "../../../../../modules/actions";
import { ETransactionErrorType } from "../../../../../modules/tx/sender/reducer";
import {
  selectTxAdditionalData,
  selectTxGasCostEthUlps,
} from "../../../../../modules/tx/sender/selectors";
import { TTokenTransferAdditionalData } from "../../../../../modules/tx/transactions/token-transfer/types";
import { TWithdrawAdditionalData } from "../../../../../modules/tx/transactions/withdraw/types";
import { ETxType } from "../../../../../modules/tx/types";
import { selectEthereumAddress } from "../../../../../modules/web3/selectors";
import { appConnect } from "../../../../../store";
import { ETxStatus } from "../../types";

export interface ITransferTransactionExternalProps {
  txHash?: string;
  blockId?: number;
  txTimestamp?: number;
  walletAddress?: string;
  error?: ETransactionErrorType;
}

export interface ITransferTransactionInternalProps {
  status: ETxStatus;
  "data-test-id"?: string;
  isMined: boolean;
  amountCaption: React.ReactNode;
}

interface IDispatchProps {
  onClick: () => void;
}

interface IStateProps {
  additionalData?: TWithdrawAdditionalData | TTokenTransferAdditionalData;
  gasCost: string;
  gasCostEur: string;
  walletAddress: string;
}

export type TTransferTransactionProps = RequiredByKeys<IStateProps, "additionalData"> &
  ITransferTransactionExternalProps &
  ITransferTransactionInternalProps &
  IDispatchProps;

export const transferTransaction = () =>
  compose<TTransferTransactionProps, ITransferTransactionExternalProps>(
    appConnect<IStateProps, IDispatchProps>({
      stateToProps: state => ({
        additionalData: selectTxAdditionalData<ETxType.WITHDRAW | ETxType.TRANSFER_TOKENS>(state),
        walletAddress: selectEthereumAddress(state),
        gasCost: selectTxGasCostEthUlps(state),
        gasCostEur: selectTxGasCostEthUlps(state),
      }),
      dispatchToProps: d => ({
        onClick: () => d(actions.txSender.txSenderHideModal()),
      }),
    }),
    branch<IStateProps>(
      props => props.additionalData === undefined,
      () => {
        throw new Error("Additional transaction data is empty");
      },
    ),
  );
