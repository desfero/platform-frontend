import { Schema } from "../../../lib/yup-ts.unsafe";
import { ETxType } from "../types";
import { TUserClaimAdditionalData, UserClaimAdditionalDataSchema } from "./claim/types";
import { EtoSetDateAdditionalDataSchema, TEtoSetDateAdditionalDataSchema } from "./eto-flow/types";
import {
  InvestmentAdditionalDataSchema,
  InvestorSignAgreementSchema,
  TInvestmentAdditionalDataYTS,
} from "./investment/types";
import { TokenAgreementContractSchema } from "./nominee/sign-agreement/types";
import {
  InvestorAcceptPayoutAdditionalDataSchema,
  TInvestorAcceptPayoutAdditionalData,
} from "./payout/types";
import { NeurRedeemAdditionalDataSchema, TNeurRedeemAdditionalData } from "./redeem/types";
import { InvestorRefundAdditionalData, InvestorRefundAdditionalSchema } from "./refund/types";
import {
  TokenTransferAdditionalData,
  TokenTransferAdditionalDataSchema,
  TTokenTransferAdditionalData,
} from "./token-transfer/types";
import { TUnlockAdditionalDataYTS, UnlockAdditionalDataSchema } from "./unlock/types";
import { TUpgradeAdditionalDataYTS, UpgradeAdditionalDataSchema } from "./upgrade/types";
import { TWithdrawAdditionalData, WithdrawAdditionalDataSchema } from "./withdraw/types";

export const typeToSchema: Record<ETxType, Schema<unknown>> = {
  [ETxType.INVEST]: InvestmentAdditionalDataSchema,
  [ETxType.USER_CLAIM]: UserClaimAdditionalDataSchema,
  [ETxType.INVESTOR_REDISTRIBUTE_PAYOUT]: InvestorAcceptPayoutAdditionalDataSchema,
  [ETxType.INVESTOR_ACCEPT_PAYOUT]: InvestorAcceptPayoutAdditionalDataSchema,
  [ETxType.NEUR_REDEEM]: NeurRedeemAdditionalDataSchema,
  [ETxType.INVESTOR_REFUND]: InvestorRefundAdditionalSchema,
  [ETxType.WITHDRAW]: WithdrawAdditionalDataSchema,
  [ETxType.TRANSFER_TOKENS]: TokenTransferAdditionalDataSchema,
  [ETxType.UNLOCK_FUNDS]: UnlockAdditionalDataSchema,
  [ETxType.UPGRADE]: UpgradeAdditionalDataSchema,
  [ETxType.ETO_SET_DATE]: EtoSetDateAdditionalDataSchema,
  [ETxType.SIGN_INVESTMENT_AGREEMENT]: InvestorSignAgreementSchema,
  [ETxType.NOMINEE_ISHA_SIGN]: TokenAgreementContractSchema,
  [ETxType.NOMINEE_RAAA_SIGN]: TokenAgreementContractSchema,
  [ETxType.NOMINEE_THA_SIGN]: TokenAgreementContractSchema,
};
export type TTransactionAdditionalData =
  | TInvestmentAdditionalDataYTS
  | TTokenTransferAdditionalData
  | TWithdrawAdditionalData
  | TUserClaimAdditionalData
  | TUpgradeAdditionalDataYTS
  | TInvestorAcceptPayoutAdditionalData
  | TokenAgreementContractSchema
  | TNeurRedeemAdditionalData
  | TokenTransferAdditionalData
  | TUnlockAdditionalDataYTS
  | TEtoSetDateAdditionalDataSchema
  | InvestorRefundAdditionalData;
