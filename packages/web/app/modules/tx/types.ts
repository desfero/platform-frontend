import { ETransactionType } from "../tx-history/types";
import { TClaimAdditionalData } from "./transactions/claim/types";
import { TEtoSetDateAdditionalData } from "./transactions/eto-flow/types";
import { TInvestmentAdditionalData } from "./transactions/investment/types";
import { TAcceptPayoutAdditionalData } from "./transactions/payout/accept/types";
import { TRedistributePayoutAdditionalData } from "./transactions/payout/redistribute/types";
import { TNEurRedeemAdditionalDetails } from "./transactions/redeem/types";
import { TRefundAdditionalData } from "./transactions/refund/types";
import { TTokenTransferAdditionalData } from "./transactions/token-transfer/types";
import { TUnlockAdditionalData } from "./transactions/unlock/types";
import { TUpgradeAdditionalData } from "./transactions/upgrade/types";
import { TWithdrawAdditionalData } from "./transactions/withdraw/types";

export interface IWithdrawDraftType {
  type: ETxSenderType.WITHDRAW;
  to: string;
  value: string;
}

export interface ITokenTransferDraftType {
  type: ETxSenderType.TRANSFER_TOKENS;
  to: string;
  value: string;
}

export interface IInvestmentDraftType {
  type: ETxSenderType.INVEST;
}

export type IDraftType = IWithdrawDraftType | IInvestmentDraftType | ITokenTransferDraftType;

export enum ETxSenderType {
  UNLOCK_FUNDS = "UNLOCK_FUNDS",
  TRANSFER_TOKENS = "TRANSFER_TOKENS",
  WITHDRAW = "WITHDRAW",
  INVEST = "INVEST",
  UPGRADE = "UPGRADE",
  ETO_SET_DATE = "ETO_SET_DATE",
  SIGN_INVESTMENT_AGREEMENT = "SIGN_INVESTMENT_AGREEMENT",
  USER_CLAIM = "USER_CLAIM",
  INVESTOR_ACCEPT_PAYOUT = "INVESTOR_ACCEPT_PAYOUT",
  INVESTOR_REDISTRIBUTE_PAYOUT = "INVESTOR_REDISTRIBUTE_PAYOUT",
  NEUR_REDEEM = "NEUR_REDEEM",
  INVESTOR_REFUND = "INVESTOR_REFUND",
  NOMINEE_THA_SIGN = "NOMINEE_THA_SIGN",
  NOMINEE_RAAA_SIGN = "NOMINEE_RAAA_SIGN",
  NOMINEE_ISHA_SIGN = "NOMINEE_ISHA_SIGN",
}

export interface ITxTypeWithData<T extends ETxSenderType | undefined, P> {
  type: T;
  additionalData: P;
}

type TTxSenderTokenTransferState = ITxTypeWithData<
  ETxSenderType.TRANSFER_TOKENS,
  TTokenTransferAdditionalData
>;

type TTxSenderWithdrawState = ITxTypeWithData<ETxSenderType.WITHDRAW, TWithdrawAdditionalData>;

type TTxSenderClaimState = ITxTypeWithData<ETxSenderType.USER_CLAIM, TClaimAdditionalData>;

type TTxSenderEtoSetDateState = ITxTypeWithData<
  ETxSenderType.ETO_SET_DATE,
  TEtoSetDateAdditionalData
>;

type TTxSenderInvestState = ITxTypeWithData<ETxSenderType.INVEST, TInvestmentAdditionalData>;

type TTxSenderAcceptPayoutState = ITxTypeWithData<
  ETxSenderType.INVESTOR_ACCEPT_PAYOUT,
  TAcceptPayoutAdditionalData
>;

type TTxSenderRedistributePayoutState = ITxTypeWithData<
  ETxSenderType.INVESTOR_REDISTRIBUTE_PAYOUT,
  TRedistributePayoutAdditionalData
>;

type TTxSenderNEurRedeemState = ITxTypeWithData<
  ETxSenderType.NEUR_REDEEM,
  TNEurRedeemAdditionalDetails
>;

export type TTxSenderNEurRedeemInitialValues = { initialAmount?: string };

type TTxSenderUnlockState = ITxTypeWithData<ETxSenderType.UNLOCK_FUNDS, TUnlockAdditionalData>;

type TTxSenderUpgradeState = ITxTypeWithData<ETxSenderType.UPGRADE, TUpgradeAdditionalData>;

type TTxSenderSignInvestmentAgreementState = ITxTypeWithData<
  ETxSenderType.SIGN_INVESTMENT_AGREEMENT,
  undefined
>;

type TTxSenderRefundState = ITxTypeWithData<ETxSenderType.INVESTOR_REFUND, TRefundAdditionalData>;

type TTxSenderNomineeSignTHAState = ITxTypeWithData<ETxSenderType.NOMINEE_THA_SIGN, undefined>;

type TTxSenderNomineeSignRAAAState = ITxTypeWithData<ETxSenderType.NOMINEE_RAAA_SIGN, undefined>;

type TTxSenderNomineeSignISHAState = ITxTypeWithData<ETxSenderType.NOMINEE_ISHA_SIGN, undefined>;

export type TSpecificTransactionState =
  | TTxSenderSignInvestmentAgreementState
  | TTxSenderUpgradeState
  | TTxSenderUnlockState
  | TTxSenderNEurRedeemState
  | TTxSenderRedistributePayoutState
  | TTxSenderAcceptPayoutState
  | TTxSenderInvestState
  | TTxSenderEtoSetDateState
  | TTxSenderWithdrawState
  | TTxSenderClaimState
  | TTxSenderRefundState
  | TTxSenderNomineeSignTHAState
  | TTxSenderNomineeSignRAAAState
  | TTxSenderTokenTransferState
  | TTxSenderNomineeSignISHAState;

export type TAdditionalDataByType<T extends ETxSenderType> = Extract<
  TSpecificTransactionState,
  { type: T }
>["additionalData"];

export type TPendingTransactionType =
  | ETransactionType.ETO_INVESTMENT
  | ETransactionType.NEUR_REDEEM
  | ETransactionType.ETO_TOKENS_CLAIM
  | ETransactionType.TRANSFER
  | ETransactionType.PAYOUT
  | ETransactionType.ETO_REFUND
  | ETransactionType.REDISTRIBUTE_PAYOUT
  | ETransactionType.NOMINEE_CONFIRMED_AGREEMENT;

export enum ETokenType {
  ETHER = "ETHER",
  EURO = "EURO",
}

export interface IAdditionalValidationData {
  isAccepted?: boolean;
  inputValue?: string;
  inputValueEuro?: string;
  maximumAvailableEther?: string;
}
