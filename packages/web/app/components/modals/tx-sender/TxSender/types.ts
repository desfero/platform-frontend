import { ETxType, ITxData } from "../../../../lib/web3/types";
import { ETransactionErrorType, ETxSenderState } from "../../../../modules/tx/sender/reducer";

export interface ITxSenderStateProps {
  isOpen: boolean;
  txTimestamp?: number;
  state: ETxSenderState;
  type?: ETxType;
  details?: ITxData;
  blockId?: number;
  txHash?: string;
  error?: ETransactionErrorType;
}

export interface ITxSenderDispatchProps {
  onCancel: () => void;
}

export type TxSenderProps = ITxSenderStateProps & ITxSenderDispatchProps;
