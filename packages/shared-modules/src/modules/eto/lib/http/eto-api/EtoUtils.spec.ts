import { convertToUlps } from "@neufund/shared-utils";
import { expect } from "chai";

import { calcInvestmentAmount, calcShareAndTokenPrice, calculateTarget } from "./EtoUtils";

describe("EtoUtils", () => {
  describe("calcShareAndTokenPrice", () => {
    it("should return correct sharePrice and TokenPrice", () => {
      expect(
        calcShareAndTokenPrice({
          preMoneyValuationEur: 1000,
          existingShareCapital: 100,
        }),
      ).to.deep.equal({ sharePrice: 10, tokenPrice: 1, tokensPerShare: 10 });
    });

    it("should return sharePrice as 0 when one of argument is undefined or 0", () => {
      expect(
        calcShareAndTokenPrice({ preMoneyValuationEur: 100, existingShareCapital: undefined }),
      ).to.deep.equal({ sharePrice: 0, tokenPrice: 0, tokensPerShare: 0 });
      expect(
        calcShareAndTokenPrice({ preMoneyValuationEur: undefined, existingShareCapital: 100 }),
      ).to.deep.equal({ sharePrice: 0, tokenPrice: 0, tokensPerShare: 0 });
      expect(
        calcShareAndTokenPrice({
          preMoneyValuationEur: undefined,
          existingShareCapital: 100,
        }),
      ).to.deep.equal({ sharePrice: 0, tokenPrice: 0, tokensPerShare: 0 });
    });

    it("should return 1 EUR token price as special case", () => {
      expect(
        calcShareAndTokenPrice({
          preMoneyValuationEur: 250000000,
          existingShareCapital: 25000,
          newShareNominalValue: 10,
        }),
      ).to.deep.equal({ sharePrice: 100000, tokenPrice: 1, tokensPerShare: 100000 });
      // that is not the case with logs of share price that are not integer
      expect(
        calcShareAndTokenPrice({
          preMoneyValuationEur: 250001000,
          existingShareCapital: 25000,
          newShareNominalValue: 10,
        }),
      ).to.deep.equal({
        sharePrice: (250001000 * 10) / 25000,
        tokenPrice: (250001000 * 10) / 25000 / 1000000,
        tokensPerShare: 1000000,
      });
    });
  });

  describe("getInvestmentAmount", () => {
    it("should calculate correctly minInvestmentAmount", () => {
      const eto = {
        preMoneyValuationEur: 1000,
        existingShareCapital: 10,
        minimumNewSharesToIssue: 100,
        newSharesToIssue: undefined,
        newSharesToIssueInFixedSlots: 10,
        newSharesToIssueInWhitelist: 5,
        fixedSlotsMaximumDiscountFraction: 0.8,
        whitelistDiscountFraction: 0.5,
        publicDiscountFraction: 0,
      };
      const sharePrice = 100;
      const { minInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      // discounts are not applied
      expect(minInvestmentAmount).to.equal(10000);
    });

    it("should return minInvestmentAmount as 0 when minimumNewSharesToIssue is 0", () => {
      const eto = {
        preMoneyValuationEur: 1000,
        existingShareCapital: 10,
        minimumNewSharesToIssue: 0,
        newSharesToIssue: undefined,
        newSharesToIssueInFixedSlots: 10,
        newSharesToIssueInWhitelist: 5,
        fixedSlotsMaximumDiscountFraction: 0.8,
        whitelistDiscountFraction: 0.5,
        publicDiscountFraction: 0,
      };
      const sharePrice = 100;
      const { minInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(minInvestmentAmount).to.equal(0);
    });

    it("should calculate correctly investment amount", () => {
      const eto = {
        preMoneyValuationEur: 125000000,
        existingShareCapital: 40859,
        newSharesToIssue: 3652,
        minimumNewSharesToIssue: 1000,
        newSharesToIssueInFixedSlots: 2252,
        newSharesToIssueInWhitelist: 700,
        fixedSlotsMaximumDiscountFraction: 0.6,
        whitelistDiscountFraction: 0.4,
        publicDiscountFraction: 0,
      };
      const sharePrice = 3059.301500281456;
      const { minInvestmentAmount, maxInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(Math.round(maxInvestmentAmount)).to.equal(6182236);
      expect(Math.round(minInvestmentAmount)).to.equal(Math.round((125000000 * 1000) / 40859));
    });

    it("should calculate correctly investment amount without whitelist", () => {
      // same terms but without whitelist
      const eto = {
        preMoneyValuationEur: 125000000,
        existingShareCapital: 40859,
        newSharesToIssue: 2952,
        minimumNewSharesToIssue: 1000,
        newSharesToIssueInFixedSlots: 2252,
        newSharesToIssueInWhitelist: 0,
        fixedSlotsMaximumDiscountFraction: 0.6,
        whitelistDiscountFraction: 0.4,
        publicDiscountFraction: 0,
      };
      const sharePrice = 3059.301500281456;
      const { minInvestmentAmount, maxInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(Math.round(maxInvestmentAmount)).to.equal(4897330);
      expect(Math.round(minInvestmentAmount)).to.equal(Math.round((125000000 * 1000) / 40859));
    });
    it("should calculate correctly investment amount with no discounts", () => {
      const eto = {
        preMoneyValuationEur: 125000000,
        existingShareCapital: 40859,
        newSharesToIssue: 3652,
        minimumNewSharesToIssue: 0,
        newSharesToIssueInFixedSlots: 2252,
        newSharesToIssueInWhitelist: 700,
        fixedSlotsMaximumDiscountFraction: 0,
        whitelistDiscountFraction: 0,
        publicDiscountFraction: 0,
      };
      const sharePrice = 3059.301500281456;
      const { minInvestmentAmount, maxInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(Math.round(maxInvestmentAmount)).to.equal(Math.round(3652 * (125000000 / 40859)));
      expect(Math.round(minInvestmentAmount)).to.equal(0);
    });

    it("should calculate correctly investment amount with with public discount fraction", () => {
      // with public discount fraction
      const eto = {
        preMoneyValuationEur: 125000000,
        existingShareCapital: 40859,
        newSharesToIssue: 3652,
        minimumNewSharesToIssue: 1000,
        newSharesToIssueInFixedSlots: 2252,
        newSharesToIssueInWhitelist: 700,
        fixedSlotsMaximumDiscountFraction: 0.6,
        whitelistDiscountFraction: 0.4,
        publicDiscountFraction: 0.2,
      };
      const sharePrice = 3059.301500281456;
      const { minInvestmentAmount, maxInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(Math.round(maxInvestmentAmount)).to.equal(
        Math.round(2755818.79 + 1284906.63 + 1713208.84),
      );
      expect(Math.round(minInvestmentAmount)).to.equal(Math.round((125000000 * 1000) / 40859));
    });

    it("should return maxInvestmentAmount as 0 when newSharesToIssue is 0", () => {
      const eto = {
        preMoneyValuationEur: 1000,
        existingShareCapital: 10,
        newSharesToIssue: 0,
        minimumNewSharesToIssue: undefined,
        newSharesToIssueInFixedSlots: 10,
        newSharesToIssueInWhitelist: 5,
        fixedSlotsMaximumDiscountFraction: 0.8,
        whitelistDiscountFraction: 0.5,
        publicDiscountFraction: 0,
      };
      const sharePrice = 100;
      const { minInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(minInvestmentAmount).to.equal(0);
    });
  });

  describe("calculateTarget", () => {
    it("should calculate", () => {
      expect(calculateTarget("10000", "50", "5000", convertToUlps("25000"))).to.eq("2500000");
      expect(calculateTarget("10000", "20", "1250", convertToUlps("1520000"))).to.eq("243200000");
    });
  });
});
