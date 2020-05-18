import { KycBankVerifiedBankAccount } from "../../lib/api/kyc/KycApi.interfaces";

export type TClaims = {
  isVerified: boolean;
  isSophisticatedInvestor: boolean;
  hasBankAccount: boolean;
  isAccountFrozen: boolean;
};

export type TBankAccount =
  | { hasBankAccount: true; details: KycBankVerifiedBankAccount }
  | { hasBankAccount: false };

export enum EBeneficialOwnerType {
  PERSON = "person",
  BUSINESS = "business",
}
