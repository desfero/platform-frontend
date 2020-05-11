import { expect } from "chai";

import { derivationPathPrefixValidator } from "./Validators";

describe("Validators", () => {
  describe("derivationPathPrefixValidator", () => {
    const correctPrefixes = [
      "44'/60'/0'/0",
      "44'/60'/0'/1",
      "44'/60'/0'/12",
      "44'/60'/1'/0",
      "44'/60'/1'/1",
      "44'/60'/1'/12",
    ];
    const incorrectPrefixes = [
      "44'/60'/0'/0'",
      "44'/60'/0'/2/",
      "44'/62'/0'/0",
      "44'/60'/0'/0a",
      "a44'/60'/0'/0",
      "44'/60'/0'/0'/s",
      "44'/62'/0'/0'",
    ];

    it("should return null for correct prefix path", () => {
      for (const dp of correctPrefixes) {
        expect(derivationPathPrefixValidator(dp)).to.be.true;
      }
    });

    it("should return string message for incorrect prefix path", () => {
      for (const dp of incorrectPrefixes) {
        expect(derivationPathPrefixValidator(dp)).to.be.false;
      }
    });
  });
});
