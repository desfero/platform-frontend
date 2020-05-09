import { branch, compose } from "recompose";

import { ETxType } from "../../../../../../lib/web3/types";
import { actions } from "../../../../../../modules/actions";
import {
  selectTxAdditionalData,
  selectTxGasCostEthUlps,
} from "../../../../../../modules/tx/sender/selectors";
import { selectEthereumAddress } from "../../../../../../modules/web3/selectors";
import { appConnect } from "../../../../../../store";
import {
  ITransferSummaryDispatchProps,
  ITransferSummaryStateProps,
  TransferSummaryLayout,
  TTransferSummaryProps,
} from "./TransferSummaryLayout";

type TStateProps = ITransferSummaryStateProps;
type TDispatchProps = ITransferSummaryDispatchProps;

export const TransferSummary = compose<TTransferSummaryProps, {}>(
  appConnect<TStateProps, TDispatchProps>({
    stateToProps: state => ({
      additionalData: selectTxAdditionalData<ETxType.TRANSFER_TOKENS | ETxType.WITHDRAW>(state),
      walletAddress: selectEthereumAddress(state),
      gasCost: selectTxGasCostEthUlps(state),
      gasCostEur: selectTxGasCostEthUlps(state),
    }),
    dispatchToProps: d => ({
      onAccept: () => d(actions.txSender.txSenderAccept()),
      onChange: () => d(actions.txSender.txSenderChange()),
    }),
  }),
  branch<TStateProps>(
    props => props.additionalData === undefined,
    () => {
      throw new Error("Additional transaction data is empty");
    },
  ),
)(TransferSummaryLayout);
