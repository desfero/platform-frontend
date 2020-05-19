import { convertToUlps } from "@neufund/shared-utils";
import { expect } from "chai";

import { testEto } from "../../../test/fixtures";
import { EEtoState } from "./lib/http/eto-api/EtoApi.interfaces.unsafe";
import { EJurisdiction } from "./lib/http/eto-api/EtoProductsApi.interfaces";
import {
  amendEtoToCompatibleFormat,
  getEtoEurMaxTarget,
  getEtoEurMinTarget,
  getEtoNextStateStartDate,
  getInvestmentCalculatedPercentage,
} from "./utils";

const mockEto = (
  state: EEtoState | undefined,
  totalTokensInt: string | undefined,
  equityTokensPerShare: number | undefined,
  minimumNewSharesToIssue: number | undefined,
  newSharesToIssue: number | undefined,
  totalEquivEur: string | undefined,
) =>
  ({
    ...testEto,
    contract: {
      ...testEto.contract,
      totalInvestment: {
        ...testEto.contract!.totalInvestment,
        totalTokensInt: totalTokensInt
          ? totalTokensInt
          : testEto.contract!.totalInvestment.totalTokensInt,
        totalEquivEurUlps: totalEquivEur
          ? convertToUlps(totalEquivEur)
          : testEto.contract!.totalInvestment.totalEquivEurUlps,
      },
    },
    equityTokensPerShare: equityTokensPerShare
      ? equityTokensPerShare
      : testEto.equityTokensPerShare,
    minimumNewSharesToIssue: minimumNewSharesToIssue
      ? minimumNewSharesToIssue
      : testEto.minimumNewSharesToIssue,
    newSharesToIssue: newSharesToIssue ? newSharesToIssue : testEto.newSharesToIssue,
    state: state ? state : testEto.state,
  } as any);

describe("eto-utils", () => {
  describe("amendEtoToCompatibleFormat", () => {
    it("should uppercase jurisdiction", () => {
      const amendedEto = amendEtoToCompatibleFormat(testEto);
      expect(testEto.product.jurisdiction).to.equal(EJurisdiction.GERMANY.toLowerCase());
      expect(amendedEto.product!.jurisdiction).to.equal(EJurisdiction.GERMANY);
    });
  });

  describe("getEtoNextStateStartDate", () => {
    it("should return next state start date", () => {
      const date = getEtoNextStateStartDate(testEto)!;
      expect(date.toString()).to.eq(new Date("2018-12-21T05:03:56.000Z").toString());
    });
  });

  describe("getInvestmentCalculatedPercentage", () => {
    it("should return correct value", () => {
      expect(
        getInvestmentCalculatedPercentage(
          mockEto(EEtoState.LISTED, undefined, undefined, undefined, undefined, undefined),
        ),
      ).to.eq(undefined);
      expect(
        getInvestmentCalculatedPercentage(
          mockEto(EEtoState.ON_CHAIN, "500", 10, 100, undefined, undefined),
        ),
      ).to.eq("50");
      expect(
        getInvestmentCalculatedPercentage(
          mockEto(EEtoState.ON_CHAIN, "250", 10, 100, undefined, undefined),
        ),
      ).to.eq("25");
      expect(
        getInvestmentCalculatedPercentage(
          mockEto(EEtoState.ON_CHAIN, "480", 24, 200, undefined, undefined),
        ),
      ).to.eq("10");
      expect(
        getInvestmentCalculatedPercentage(
          mockEto(EEtoState.ON_CHAIN, "1000", 10, 100, undefined, undefined),
        ),
      ).to.eq("100");
    });
  });

  describe("getEtoEurMinTarget", () => {
    it("should return correct values", () => {
      // 7% of min shares
      expect(
        getEtoEurMinTarget(mockEto(EEtoState.ON_CHAIN, "70", 10, 100, undefined, "700")),
      ).to.eq("10000");
      // 20% of min shares
      expect(
        getEtoEurMinTarget(mockEto(EEtoState.ON_CHAIN, "200", 10, 100, undefined, "12345")),
      ).to.eq("61725");
      // 50% of min shares
      expect(
        getEtoEurMinTarget(mockEto(EEtoState.ON_CHAIN, "500", 10, 100, undefined, "5200")),
      ).to.eq("10400");
      // 100% of min shares
      expect(
        getEtoEurMinTarget(mockEto(EEtoState.ON_CHAIN, "1000", 10, 100, undefined, "5200")),
      ).to.eq("5200");
    });
  });

  describe("getEtoEurMaxTarget", () => {
    it("should return correct values", () => {
      // 7% of min shares
      expect(
        getEtoEurMaxTarget(mockEto(EEtoState.ON_CHAIN, "70", 10, undefined, 100, "700")),
      ).to.eq("10000");
      // 20% of min shares
      expect(
        getEtoEurMaxTarget(mockEto(EEtoState.ON_CHAIN, "200", 10, undefined, 100, "12345")),
      ).to.eq("61725");
      // 50% of min shares
      expect(
        getEtoEurMaxTarget(mockEto(EEtoState.ON_CHAIN, "500", 10, undefined, 100, "5200")),
      ).to.eq("10400");
      // 100% of min shares
      expect(
        getEtoEurMaxTarget(mockEto(EEtoState.ON_CHAIN, "1000", 10, undefined, 100, "5200")),
      ).to.eq("5200");
    });
  });
});
