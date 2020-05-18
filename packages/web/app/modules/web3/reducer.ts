import { AppReducer } from "../../store";
import { actions } from "../actions";
import { TWalletMetadata } from "./types";

export interface IDisconnectedWeb3State {
  connected: false;
  previousConnectedWallet?: TWalletMetadata;
  web3Available: boolean;
}

export interface IWalletPrivateData {
  seed: string[];
  privateKey: string;
}
export interface IConnectedWeb3State {
  connected: true;
  wallet: TWalletMetadata;
  walletPrivateData?: {
    seed: string;
    privateKey: string;
  };
  web3Available: boolean;
}

export type IWeb3State = IDisconnectedWeb3State | IConnectedWeb3State;

export const web3InitialState: IDisconnectedWeb3State = {
  connected: false,
  web3Available: false,
};

export const web3Reducer: AppReducer<IWeb3State> = (
  state = web3InitialState,
  action,
): IWeb3State => {
  switch (action.type) {
    case "NEW_PERSONAL_WALLET_PLUGGED":
      return {
        connected: true,
        wallet: action.payload.walletMetadata,
        web3Available: state.web3Available,
      };
    case actions.web3.personalWalletDisconnected.getType():
      return {
        connected: false,
        previousConnectedWallet: state.connected ? state.wallet : state.previousConnectedWallet,
        web3Available: state.web3Available,
      };
    case "LOAD_PREVIOUS_WALLET":
      if (!state.connected) {
        return {
          ...state,
          previousConnectedWallet: action.payload,
        };
      } else {
        return state;
      }
    case "WEB3_LOAD_SEED":
      if (state.connected) {
        return {
          ...state,
          walletPrivateData: {
            seed: action.payload.seed,
            privateKey: action.payload.privateKey,
          },
        };
      } else {
        return state;
      }
    case "WEB3_CLEAR_SEED":
      if (state.connected) {
        return {
          ...state,
          walletPrivateData: undefined,
        };
      } else {
        return state;
      }
    case actions.web3.setWeb3Status.getType():
      return {
        ...state,
        web3Available: action.payload.web3Available,
      };
  }
  return state;
};
