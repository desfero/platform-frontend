import { ETransactionType } from "../../lib/api/analytics-api/interfaces";
import { ETxType } from "../../lib/web3/types";
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
  type: ETxType.WITHDRAW;
  to: string;
  value: string;
}

export interface ITokenTransferDraftType {
  type: ETxType.TRANSFER_TOKENS;
  to: string;
  value: string;
}

export interface IInvestmentDraftType {
  type: ETxType.INVEST;
}

export type IDraftType = IWithdrawDraftType | IInvestmentDraftType | ITokenTransferDraftType;

export interface ITxTypeWithData<T extends ETxType | undefined, P> {
  type: T;
  additionalData: P;
}

type TTxSenderTokenTransferState = ITxTypeWithData<
  ETxType.TRANSFER_TOKENS,
  TTokenTransferAdditionalData
>;

type TTxSenderWithdrawState = ITxTypeWithData<ETxType.WITHDRAW, TWithdrawAdditionalData>;

type TTxSenderClaimState = ITxTypeWithData<ETxType.USER_CLAIM, TClaimAdditionalData>;

type TTxSenderEtoSetDateState = ITxTypeWithData<ETxType.ETO_SET_DATE, TEtoSetDateAdditionalData>;

type TTxSenderInvestState = ITxTypeWithData<ETxType.INVEST, TInvestmentAdditionalData>;

type TTxSenderAcceptPayoutState = ITxTypeWithData<
  ETxType.INVESTOR_ACCEPT_PAYOUT,
  TAcceptPayoutAdditionalData
>;

type TTxSenderRedistributePayoutState = ITxTypeWithData<
  ETxType.INVESTOR_REDISTRIBUTE_PAYOUT,
  TRedistributePayoutAdditionalData
>;

type TTxSenderNEurRedeemState = ITxTypeWithData<ETxType.NEUR_REDEEM, TNEurRedeemAdditionalDetails>;

export type TTxSenderNEurRedeemInitialValues = { initialAmount?: string };

type TTxSenderUnlockState = ITxTypeWithData<ETxType.UNLOCK_FUNDS, TUnlockAdditionalData>;

type TTxSenderUpgradeState = ITxTypeWithData<ETxType.UPGRADE, TUpgradeAdditionalData>;

type TTxSenderSignInvestmentAgreementState = ITxTypeWithData<
  ETxType.SIGN_INVESTMENT_AGREEMENT,
  undefined
>;

type TTxSenderRefundState = ITxTypeWithData<ETxType.INVESTOR_REFUND, TRefundAdditionalData>;

type TTxSenderNomineeSignTHAState = ITxTypeWithData<ETxType.NOMINEE_THA_SIGN, undefined>;

type TTxSenderNomineeSignRAAAState = ITxTypeWithData<ETxType.NOMINEE_RAAA_SIGN, undefined>;

type TTxSenderNomineeSignISHAState = ITxTypeWithData<ETxType.NOMINEE_ISHA_SIGN, undefined>;

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

export type TAdditionalDataByType<T extends ETxType> = Extract<
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
