import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import * as Yup from "yup";

// normalized information about all possible types of personal wallets
export enum EWalletType {
  LEDGER = "LEDGER",
  MOBILE = "MOBILE",
  WALLETCONNECT = "WALLETCONNECT",
  BROWSER = "BROWSER",
  LIGHT = "LIGHT",
  UNKNOWN = "UNKNOWN",
}

export enum EWalletSubType {
  METAMASK = "METAMASK",
  PARITY = "PARITY",
  GNOSIS = "GNOSIS",
  NEUFUND = "NEUFUND",
  UNKNOWN = "UNKNOWN",
}

export enum EUserType {
  INVESTOR = "investor",
  ISSUER = "issuer",
  NOMINEE = "nominee",
}

export interface IVerifyEmailUser {
  verificationCode: string;
}

export interface IUser {
  userId: EthereumAddressWithChecksum;
  backupCodesVerified?: boolean;
  latestAcceptedTosIpfs?: string;
  language?: string;
  unverifiedEmail?: string;
  verifiedEmail?: string;
  type: EUserType;
  walletType: EWalletType;
  walletSubtype: EWalletSubType;
}

export interface IEmailStatus {
  isAvailable: boolean;
}

export interface IUserInput {
  newEmail?: string;
  salt?: string;
  language?: string;
  backupCodesVerified?: boolean;
  type: EUserType;
  walletType: EWalletType;
  walletSubtype: EWalletSubType;
}

export const UserSchema = Yup.object({
  userId: Yup.string().required(),
  backupCodesVerified: Yup.boolean(),
  latestAcceptedTosIpfs: Yup.string(),
  language: Yup.string(),
  unverifiedEmail: Yup.string(),
  verifiedEmail: Yup.string(),
  type: Yup.string().oneOf(Object.values(EUserType)),
  walletType: Yup.string().oneOf(Object.keys(EWalletType).map(type => type.toLowerCase())),
  walletSubtype: Yup.string().oneOf(Object.keys(EWalletSubType).map(type => type.toLowerCase())),
}).required();

export const EmailStatusSchema = Yup.object({
  isAvailable: Yup.boolean(),
});
