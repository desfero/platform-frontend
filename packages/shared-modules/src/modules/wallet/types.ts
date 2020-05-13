export enum ENEURWalletStatus {
  ENABLED = "enabled",
  DISABLED_NON_VERIFIED = "inactive_non_verified",
  DISABLED_RESTRICTED_US_STATE = "disabled_restricted_us_state",
}

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
