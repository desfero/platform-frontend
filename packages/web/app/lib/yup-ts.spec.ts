import { expect } from "chai";

import * as YupTS from "./yup-ts.unsafe";

describe("Yup-ts", () => {
  describe("onlyTrue", () => {
    it("allows only true", () => {
      const spec = YupTS.onlyTrue();
      const validator = spec.toYup();
      expect(validator.isValidSync(true)).to.be.true;
      expect(validator.isValidSync(false)).to.be.false;
      expect(validator.isValidSync(undefined)).to.be.false;
    });

    it("allows optional true", () => {
      const spec = YupTS.onlyTrue().optional();
      const validator = spec.toYup();
      expect(validator.isValidSync(true)).to.be.true;
      expect(validator.isValidSync(undefined)).to.be.true;
    });
  });

  describe("wysiwygString", () => {
    it("adds `isWysiwyg` meta flag", () => {
      const spec = YupTS.wysiwygString();
      const validator = spec.toYup();
      expect(validator.describe()).to.deep.include({ meta: { isWysiwyg: true } });
    });
  });
});
