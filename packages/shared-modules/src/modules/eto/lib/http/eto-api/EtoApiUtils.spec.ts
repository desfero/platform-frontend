import { expect } from "chai";

import { TEtoWithCompanyAndContractReadonly } from "../../../modules/eto/types";
import { EFundingRound } from "./EtoApi.interfaces.unsafe";
import { getNextFundingRound } from "./EtoApiUtils";

describe("EtoApiUtils", () => {
  describe("getNextFundingRound", () => {
    it("no data", () => {
      const data = { company: { companyStage: undefined } };
      expect(getNextFundingRound(data as TEtoWithCompanyAndContractReadonly)).to.be.undefined;
    });

    it("PRE_SEED", () => {
      const data = { company: { companyStage: EFundingRound.PRE_SEED } };
      expect(getNextFundingRound(data as TEtoWithCompanyAndContractReadonly)).to.equal("Seed");
    });

    it("B_ROUND", () => {
      const data = { company: { companyStage: EFundingRound.B_ROUND } };
      expect(getNextFundingRound(data as TEtoWithCompanyAndContractReadonly)).to.equal("Series C");
    });

    it("PUBLIC", () => {
      const data = { company: { companyStage: EFundingRound.PUBLIC } };
      expect(getNextFundingRound(data as TEtoWithCompanyAndContractReadonly)).to.be.undefined;
    });
  });
});
