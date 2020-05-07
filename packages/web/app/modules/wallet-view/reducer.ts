import { actions } from "../actions";
import { EthereumAddressWithChecksum, selectUnits } from "@neufund/shared-utils";
import { EProcessState } from "../../utils/enums/processStates";
import { AppReducer } from "../../store";

export enum EBalanceType {
  ETH = "WALLET_TYPE_ETH",
  NEUR = "WALLET_TYPE_NEUR",
  ICBM_ETH = "WALLET_TYPE_ICBM_ETH",
  ICBM_NEUR = "WALLET_TYPE_ICBM_NEUR",
  LOCKED_ICBM_ETH = "WALLET_TYPE_LOCKED_ICBM_ETH",
  LOCKED_ICBM_NEUR = "WALLET_TYPE_LOCKED_ICBM_NEUR",
}

export type TWalletData = {
  name: string //fixme
  amount: string
  euroEquivalentAmount:string
}

export type TWalletViewState = {
  processState: EProcessState.SUCCESS,
  wallets: TWalletData[],
  walletBalanceEuro: string
  userAddress: EthereumAddressWithChecksum
} | {
  processState: EProcessState.ERROR | EProcessState.NOT_STARTED | EProcessState.IN_PROGRESS,
}

const walletViewInitialState:TWalletViewState = {
  processState: EProcessState.NOT_STARTED,
}

export const walletViewReducer:AppReducer<TWalletViewState> = (
  state = walletViewInitialState,
    action,
) => {
  switch (action.type) {
    case actions.walletView.walletViewSetData.getType():
      console.log("--action!",JSON.stringify(action.payload))
      return action.payload;

    default:
      return state;
  }
};
