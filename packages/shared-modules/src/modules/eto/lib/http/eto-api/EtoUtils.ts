import { convertFromUlps, divideBigNumbers, multiplyBigNumbers } from "@neufund/shared-utils";

import { TBigNumberVariants } from "../../web3/types";
import { TPartialEtoSpecData } from "./EtoApi.interfaces.unsafe";

export const calcInvestmentAmount = (eto: TPartialEtoSpecData, sharePrice: number | undefined) => ({
  minInvestmentAmount: calcMaxInvestmentAmount(sharePrice, eto.minimumNewSharesToIssue),
  maxInvestmentAmount: calcMaxInvestmentAmountWithDiscount(eto, sharePrice, eto.newSharesToIssue),
});

export const calcNumberOfTokens = ({
  preMoneyValuationEur = 0,
  existingShareCapital = 0,
  newShareNominalValue = 1,
  newSharesToIssue = 1,
  minimumNewSharesToIssue = 0,
}: TPartialEtoSpecData) => {
  let computedMaxNumberOfTokens = 0;
  let computedMinNumberOfTokens = 0;
  const sharePrice = calcSharePrice({
    preMoneyValuationEur,
    existingShareCapital,
    newShareNominalValue,
  });
  if (sharePrice > 0) {
    const equityTokensPerShare = calcTokensPerShareFromSharePrice(sharePrice);
    computedMaxNumberOfTokens = newSharesToIssue * equityTokensPerShare;
    computedMinNumberOfTokens = minimumNewSharesToIssue * equityTokensPerShare;
  }
  return { computedMaxNumberOfTokens, computedMinNumberOfTokens };
};

export const calcCapFraction = ({
  newSharesToIssue = 1,
  minimumNewSharesToIssue = 0,
  existingShareCapital = 1,
  newShareNominalValue = 1,
}: TPartialEtoSpecData) => ({
  computedMaxCapPercent: ((newSharesToIssue * newShareNominalValue) / existingShareCapital) * 100,
  computedMinCapPercent:
    ((minimumNewSharesToIssue * newShareNominalValue) / existingShareCapital) * 100,
});

export const calcShareAndTokenPrice = ({
  preMoneyValuationEur = 0,
  existingShareCapital = 0,
  newShareNominalValue = 1,
}: TPartialEtoSpecData) => {
  let tokenPrice = 0;
  let tokensPerShare = 0;
  const sharePrice = calcSharePrice({
    preMoneyValuationEur,
    existingShareCapital,
    newShareNominalValue,
  });
  if (sharePrice > 0) {
    tokensPerShare = calcTokensPerShareFromSharePrice(sharePrice);
    tokenPrice = sharePrice / tokensPerShare;
  }
  return {
    sharePrice,
    tokenPrice,
    tokensPerShare,
  };
};

export const calcSharePrice = ({
  preMoneyValuationEur = 0,
  existingShareCapital = 0,
  newShareNominalValue = 1,
}: TPartialEtoSpecData) => {
  let sharePrice = 0;
  if (existingShareCapital !== 0) {
    sharePrice = (preMoneyValuationEur * newShareNominalValue) / existingShareCapital;
  }
  return sharePrice;
};

const calcTokensPerShareFromSharePrice = (sharePrice: number) => {
  let tokensPerShare;
  const sharePriceLog = Math.log10(sharePrice);
  if (sharePriceLog < 0) {
    tokensPerShare = 0;
  } else {
    let powers = Math.floor(sharePriceLog);
    // for powers of 10 keep be inclusive to previous divisor so we can have 1 EUR token price
    if (powers === sharePriceLog) {
      powers -= 1;
    }
    tokensPerShare = Math.pow(10, powers + 1);
  }
  return tokensPerShare;
};

const calcMaxInvestmentAmountWithDiscount = (
  {
    newSharesToIssueInFixedSlots = 0,
    newSharesToIssueInWhitelist = 0,
    fixedSlotsMaximumDiscountFraction = 0,
    whitelistDiscountFraction = 0,
    publicDiscountFraction = 0,
  }: TPartialEtoSpecData,
  sharePrice = 0,
  shares = 0,
) => {
  if (sharePrice === 0 || shares === 0) {
    return 0;
  }

  if (
    fixedSlotsMaximumDiscountFraction > 1 ||
    whitelistDiscountFraction > 1 ||
    publicDiscountFraction > 1
  ) {
    throw new Error("Fraction number is required instead of percentage value");
  }

  let amount = 0;

  if (fixedSlotsMaximumDiscountFraction > 0 && shares > 0) {
    const minShares = Math.min(newSharesToIssueInFixedSlots, shares);

    amount += minShares * sharePrice * (1 - fixedSlotsMaximumDiscountFraction);
    shares -= minShares;
  }

  if (whitelistDiscountFraction > 0 && shares > 0) {
    const minShares = Math.min(newSharesToIssueInWhitelist, shares);

    amount += minShares * sharePrice * (1 - whitelistDiscountFraction);
    shares -= minShares;
  }

  if (shares > 0) {
    amount += shares * sharePrice * (1 - publicDiscountFraction);
  }

  return amount;
};

const calcMaxInvestmentAmount = (sharePrice = 0, shares = 0) => {
  if (sharePrice === 0 || shares === 0) {
    return 0;
  }
  return shares * sharePrice;
};

export const calculateTarget = (
  sharesToIssue: TBigNumberVariants,
  equityTokensPerShare: TBigNumberVariants,
  totalTokensInt: TBigNumberVariants,
  totalEquivEurUlps: TBigNumberVariants,
) => {
  const targetTokens = multiplyBigNumbers([sharesToIssue, equityTokensPerShare]);

  if (totalTokensInt === "0" || totalEquivEurUlps === "0") {
    return targetTokens;
  }

  const totalEquivEur = convertFromUlps(totalEquivEurUlps);
  const averageTokenPrice = divideBigNumbers(totalEquivEur, totalTokensInt);

  return multiplyBigNumbers([averageTokenPrice, targetTokens]);
};

export const calculateCurrentInvestmentProgressPercentage = (
  totalTokensInt: string,
  minimumNewSharesToIssue: string,
  equityTokensPerShare: string,
) => {
  const minimumNewTokensToIssue = multiplyBigNumbers([
    minimumNewSharesToIssue,
    equityTokensPerShare,
  ]);
  const currentInvestmentProgressFraction = divideBigNumbers(
    totalTokensInt,
    minimumNewTokensToIssue,
  );

  return multiplyBigNumbers([currentInvestmentProgressFraction, "100"]);
};
