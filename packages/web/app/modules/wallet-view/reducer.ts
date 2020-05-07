import { actions } from "../actions";
import { EProcessState } from "../../utils/enums/processStates";
import { AppReducer } from "../../store";

export type TWalletViewData = {}

export type TWalletViewState = {
  processState: EProcessState,
  wallets: TWalletViewData[]
}

const walletViewInitialState:TWalletViewState = {
  processState: EProcessState.NOT_STARTED,
  wallets: []
}

export const walletViewReducer:AppReducer<TWalletViewState> = (
  state = walletViewInitialState,
    action,
) => {
  switch (action.type) {
    case actions.walletView.walletViewSetError.getType():
      return {
        ...state,
        processState: EProcessState.ERROR,
      };
    case actions.walletView.walletViewSetData.getType():
      return {
        ...state,
        processState: EProcessState.SUCCESS,
        wallets: action.payload.wallets
      };

    default:
      return state;
  }
};
