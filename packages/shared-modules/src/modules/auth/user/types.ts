import { EUserType, EWalletSubType, EWalletType } from "../lib/users/interfaces";

export type TWalletMetadata = {
  walletType: EWalletType;
  walletSubType: EWalletSubType;
  email?: string;
  salt?: string;
};

export type TLoadOrCreateOptions = {
  userType: EUserType;
  walletMetadata: TWalletMetadata;
  email?: string;
  salt?: string;
  backupCodesVerified?: boolean;
};
