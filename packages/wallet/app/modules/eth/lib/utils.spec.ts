import { isAddress, isPrivateKey, isMnemonic, isChecksumAddress } from "./utils";

const EMPTY_STRING = "";

describe("utils", () => {
  describe("isPrivateKey", () => {
    it("should return true for a valid private key", async () => {
      const privateKeys = ["0x79177f5833b64c8fdcc9862f5a779b8ff0e1853bf6e9e4748898d4b6de7e8c93"];

      privateKeys.forEach(privateKey => {
        expect(isPrivateKey(privateKey)).toBeTruthy();
      });
    });

    it("should return false for an invalid private key", async () => {
      const privateKeys = [
        "79177f5833b64c8fdcc9862f5a779b8ff0e1853bf6e9e4748898d4b6de7e8c93",
        "0xF79177f5833b64c8fdcc9862f5a779b8ff0e1853bf6e9e4748898d4b6de7e8c93",
        "0x9177f5833b64c8fdcc9862f5a779b8ff0e1853bf6e9e4748898d4b6de7e8c93",
        EMPTY_STRING,
      ];

      privateKeys.forEach(privateKey => {
        expect(isPrivateKey(privateKey)).toBeFalsy();
      });
    });
  });

  describe("isAddress", () => {
    it("should return true for a valid address", async () => {
      const addresses = [
        // checksummed
        "0x30fD2af22459B61F5bdfdDcaeF9BFaD6AcBF9fDC",
        // lower case
        "0x30fd2af22459b61f5bdfddcaef9bfad6acbf9fdc",
        // upper case
        "0x30FD2AF22459B61F5BDFDDCAEF9BFAD6ACBF9FDC",
      ];

      addresses.forEach(address => {
        expect(isAddress(address)).toBeTruthy();
      });
    });

    it("should return false for an invalid address", async () => {
      const addresses = [
        // mixed case
        "0x30Fd2AF22459B61F5bDFDDCAEF9BFAD6aCBF9FDc",
        "0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
        "random string",
      ];

      addresses.forEach(address => {
        expect(isAddress(address)).toBeFalsy();
      });
    });
  });

  describe("isChecksumAddress", () => {
    it("should return true for a valid address", async () => {
      const addresses = [
        // checksummed
        "0x30fD2af22459B61F5bdfdDcaeF9BFaD6AcBF9fDC",
      ];

      addresses.forEach(address => {
        expect(isChecksumAddress(address)).toBeTruthy();
      });
    });

    it("should return false for an invalid address", async () => {
      const addresses = [
        // lower case
        "0x30fd2af22459b61f5bdfddcaef9bfad6acbf9fdc",
        // upper case
        "0x30FD2AF22459B61F5BDFDDCAEF9BFAD6ACBF9FDC",
        // mixed case
        "0x30Fd2AF22459B61F5bDFDDCAEF9BFAD6aCBF9FDc",
        "0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
        "random string",
      ];

      addresses.forEach(address => {
        expect(isChecksumAddress(address)).toBeFalsy();
      });
    });
  });

  describe("isMnemonic", () => {
    it("should return true for a valid mnemonics", async () => {
      const mnemonics = [
        "sword grace service smile staff weather fog husband slush diary silent artwork orbit wedding twelve mammal lamp position sorry weird foot record wide pioneer",
        "flat range capital party must this hero receive clown patch online index",
      ];

      mnemonics.forEach(mnemonic => {
        expect(isMnemonic(mnemonic)).toBeTruthy();
      });
    });

    it("should return false for an invalid mnemonics", async () => {
      const mnemonics = [
        "flat range capital party car this hero receive clown patch online index",
        "pool hockey win moral spike wine renew space frequent early boost carry federal unlock rent code topic nature business elite vivid setup stand mosquito foo",
        "one two three",
        EMPTY_STRING,
      ];

      mnemonics.forEach(mnemonic => {
        expect(isMnemonic(mnemonic)).toBeFalsy();
      });
    });
  });
});
