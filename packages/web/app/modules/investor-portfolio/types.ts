import { ECurrency } from "@neufund/shared";

import { IEtoTokenData, TEtoWithCompanyAndContractReadonly } from "../eto/types";

export interface ITokenDisbursal {
  token: ECurrency;
  amountToBeClaimed: string;
  totalDisbursedAmount: string;
  timeToFirstDisbursalRecycle: number;
  tokenDecimals: number;
  amountEquivEur: string;
}

export type TTokenDisbursalData = {
  loading: boolean;
  error: boolean;
  data?: ITokenDisbursal[];
};

export interface IInvestorTicket {
  equivEurUlps: string;
  rewardNmkUlps: string;
  equityTokenInt: string;
  sharesInt: string;
  tokenPrice: string;
  neuRate: string;
  amountEth: string;
  amountEurUlps: string;
  claimedOrRefunded: boolean;
  usedLockedAccount: boolean;
}

export interface ICalculatedContribution {
  isWhitelisted: boolean;
  isEligible: boolean;
  minTicketEurUlps: string;
  maxTicketEurUlps: string;
  equityTokenInt: string;
  neuRewardUlps: string;
  maxCapExceeded: boolean;
}

export interface IWhitelistTicket {
  whitelistDiscountAmountEurUlps: string;
  whitelistDiscountFrac: number;
}

export type TTokensPersonalDiscount = IWhitelistTicket & {
  whitelistDiscountUlps: string;
};

export interface IPersonalDiscount {
  whitelistDiscountAmountLeft: string;
  whitelistDiscountUlps: string;
  whitelistDiscountFrac: number;
}

export type TETOWithInvestorTicket = TEtoWithCompanyAndContractReadonly & {
  investorTicket: IInvestorTicket;
};

export type TETOWithTokenData = TEtoWithCompanyAndContractReadonly & {
  tokenData: IEtoTokenData;
};

export interface IIncomingPayoutsData {
  euroTokenIncomingPayoutValue: string;
  etherTokenIncomingPayoutValue: string;
  snapshotDate: number; //posix timestamp
}

export interface IIncomingPayouts {
  loading: boolean;
  error: boolean;
  data?: IIncomingPayoutsData;
}

export enum EUserRefundStatus {
  CANNOT_CLAIM = "cannot_claim",
  CAN_CLAIM = "can_claim",
  CLAIMED = "claimed",
}
