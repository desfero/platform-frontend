import { AppReducer } from "@neufund/sagas";
import { StateFromReducersMapObject } from "redux";

import { walletActions } from "./actions";

export interface IWalletState {
  loading: boolean;
  error?: string;
  data?: IWalletStateData;
}

export interface ILockedWallet {
  LockedBalance: string;
  neumarksDue: string;
  unlockDate: string;
}

// balances of all coins are represented by bignumber.js strings
export interface IWalletStateData {
  euroTokenLockedWallet: ILockedWallet;
  etherTokenLockedWallet: ILockedWallet;

  etherTokenBalance: string;
  euroTokenBalance: string;
  etherBalance: string;
  neuBalance: string;

  euroTokenICBMLockedWallet: ILockedWallet;
  etherTokenICBMLockedWallet: ILockedWallet;
  etherTokenUpgradeTarget?: string;
  euroTokenUpgradeTarget?: string;
  // TODO: Remove once
  neumarkAddress: string;
}

const walletInitialState: IWalletState = {
  loading: true,
};

export const walletReducer: AppReducer<IWalletState, typeof walletActions> = (
  state = walletInitialState,
  action,
): IWalletState => {
  switch (action.type) {
    case "WALLET_SAVE_WALLET_DATA":
      return {
        loading: false,
        error: undefined,
        data: action.payload.data,
      };
    case "WALLET_LOAD_WALLET_DATA_ERROR":
      return {
        loading: false,
        error: action.payload.errorMsg,
        data: state.data,
      };
  }

  return state;
};

const walletReducerMap = {
  wallet: walletReducer,
};

export { walletReducerMap };

export type TModuleState = StateFromReducersMapObject<typeof walletReducerMap>;
