import { EUserType } from "@neufund/shared-modules";
import { convertToUlps, ETH_DECIMALS, multiplyBigNumbers, Q18 } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";
import { includes } from "lodash/fp";

import { IWindowWithData } from "../../../test/helperTypes";
import { ECurrency } from "../../components/shared/formatters/utils";
import { EETOStateOnChain } from "../eto/types";
import {
  EUserRefundStatus,
  ICalculatedContribution,
  IInvestorTicket,
  ITokenDisbursal,
} from "./types";

// when calculating minimum ticket, this is defult value for subsequent investments
// in the same ETO
export const MIMIMUM_RETAIL_TICKET_EUR_ULPS = Q18.mul("10");

export const convertToCalculatedContribution = ([
  isWhitelisted,
  isEligible,
  minTicketEurUlps,
  maxTicketEurUlps,
  equityTokenInt,
  neuRewardUlps,
  maxCapExceeded,
]: [
  boolean,
  boolean,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  boolean,
]): ICalculatedContribution => ({
  isWhitelisted,
  isEligible,
  minTicketEurUlps: minTicketEurUlps.toString(),
  maxTicketEurUlps: maxTicketEurUlps.toString(),
  equityTokenInt: equityTokenInt.toString(),
  neuRewardUlps: neuRewardUlps.toString(),
  maxCapExceeded,
});

export const convertToInvestorTicket = ([
  equivEurUlps,
  rewardNmkUlps,
  equityTokenInt,
  sharesInt,
  tokenPrice,
  neuRate,
  amountEth,
  amountEurUlps,
  claimedOrRefunded,
  usedLockedAccount,
]: [
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  boolean,
  boolean,
]): IInvestorTicket => ({
  equivEurUlps: equivEurUlps.toString(),
  rewardNmkUlps: rewardNmkUlps.toString(),
  equityTokenInt: equityTokenInt.toString(),
  sharesInt: sharesInt.toString(),
  tokenPrice: tokenPrice.toString(),
  neuRate: neuRate.toString(),
  amountEth: amountEth.toString(),
  amountEurUlps: amountEurUlps.toString(),
  claimedOrRefunded,
  usedLockedAccount,
});

export const convertToTokenDisbursal = (
  token: ECurrency,
  [amountToBeClaimed, totalDisbursedAmount, timeToFirstDisbursalRecycle]: [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
  ],
  etherPrice: string,
): ITokenDisbursal => ({
  token,
  amountToBeClaimed: amountToBeClaimed.toString(),
  totalDisbursedAmount: totalDisbursedAmount.toString(),
  tokenDecimals: ETH_DECIMALS,
  amountEquivEur:
    token === ECurrency.ETH
      ? multiplyBigNumbers([amountToBeClaimed.toString(), etherPrice])
      : amountToBeClaimed.toString(),
  // convert seconds timestamp to milliseconds
  timeToFirstDisbursalRecycle: timeToFirstDisbursalRecycle.mul("1000").toNumber(),
});

export const convertToWhitelistTicket = ([
  isWhitelisted,
  whitelistDiscountAmountEurUlps,
  fullTokenPriceFrac,
]: [boolean, BigNumber, BigNumber]) => ({
  isWhitelisted,
  whitelistDiscountAmountEurUlps,
  fullTokenPriceFrac,
});

export const getTokenPrice = (equityTokenInt: string, equivEurUlps: string): string => {
  const equivEurUlpsBn = new BigNumber(equivEurUlps);
  if (equivEurUlpsBn.isZero()) {
    return "0";
  }

  const equityToken = Q18.mul(equityTokenInt);
  return equivEurUlpsBn.div(equityToken).toString();
};

export const getRequiredIncomingAmount = (token: ECurrency) => {
  // In case of Cypress tests we have to return 0 by default to prevent tests with low amounts from crash
  // If there is data stored in window use it
  if (process.env.NF_CYPRESS_RUN === "1") {
    const { payoutRequiredAmount } = window as IWindowWithData;
    return payoutRequiredAmount || "0";
  }

  switch (token) {
    case ECurrency.ETH: {
      return convertToUlps("1");
    }
    case ECurrency.EUR_TOKEN: {
      return convertToUlps("100");
    }
    default:
      return "0";
  }
};

export const isPastInvestment = (etoState: EETOStateOnChain) =>
  includes(etoState, [EETOStateOnChain.Payout, EETOStateOnChain.Refund, EETOStateOnChain.Claim]);

// TODO: Remove dependency on userType
export const getRefundStatus = (
  etoState: EETOStateOnChain,
  userType: EUserType | undefined,
  doesInvestorInvest: boolean,
  investorTicket: IInvestorTicket | undefined,
): EUserRefundStatus => {
  if (
    etoState === EETOStateOnChain.Refund &&
    userType === EUserType.INVESTOR &&
    doesInvestorInvest &&
    investorTicket
  ) {
    if (investorTicket.claimedOrRefunded) {
      return EUserRefundStatus.CLAIMED;
    } else {
      return EUserRefundStatus.CAN_CLAIM;
    }
  } else {
    return EUserRefundStatus.CANNOT_CLAIM;
  }
};

export const snapshotIsActual = (snapshotDate: number, now: Date) => {
  const snapshotInMilliseconds = snapshotDate * 1000;

  const dates: [number, number][] = [
    [new Date(snapshotInMilliseconds).getUTCFullYear(), now.getUTCFullYear()],
    [new Date(snapshotInMilliseconds).getUTCMonth(), now.getUTCMonth()],
    [new Date(snapshotInMilliseconds).getUTCDate(), now.getUTCDate()],
  ];

  return dates.reduce(
    (acc: boolean, pair: [number, number]): boolean => acc && pair[0] === pair[1],
    true,
  );
};
