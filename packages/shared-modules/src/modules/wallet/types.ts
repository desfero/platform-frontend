import { TModuleState } from "../../types";
import { setupWalletModule } from "./module";

export interface IWalletState {
  loading: boolean;
  error: string | undefined;
  data: IWalletStateData | undefined;
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

export type TWalletModuleState = TModuleState<typeof setupWalletModule>;
