import { AppReducer } from "../../store";
import { EProcessState } from "../../utils/enums/processStates";
import { actions } from "../actions";
import { TWalletViewState } from "./types";


const walletViewInitialState:TWalletViewState = {
  processState: EProcessState.NOT_STARTED,
}

export const walletViewReducer:AppReducer<TWalletViewState> = (
  state = walletViewInitialState,
    action,
) => {
  switch (action.type) {
    case actions.walletView.walletViewSetData.getType():
      return action.payload;

    default:
      return state;
  }
};
