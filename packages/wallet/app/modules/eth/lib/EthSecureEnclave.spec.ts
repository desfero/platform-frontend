import { noopLogger } from "@neufund/shared-modules";
import { toEthereumHDPath } from "@neufund/shared-utils";

import { DeviceInformation } from "modules/device-information/DeviceInformation";

import { createMock } from "utils/testUtils.specUtils";

import {
  EthSecureEnclave,
  FailedToDerivePrivateKey,
  NoSecretFoundError,
  SecretNotAMnemonicError,
  SecretNotAPrivateKeyError,
} from "./EthSecureEnclave";
import { toSecureReference } from "./SecureStorage";
import { getInternetCredentials } from "./__mocks__/react-native-keychain";
import { isMnemonic } from "./utils";

describe("EthSecureEnclave (with SecureStorage)", () => {
  const messageHash = "0xc7595adb6684bd03eb6ee54f10b0224e4bcfdaa5d393187583eb1777ae169d80";
  const privateKey = "0xc8f0b2c1a527e9c69495341ed9eb4ba51943abd1f35bed2e08fa29895ad902e2";
  const mnemonic =
    "timber rely gap brown useful craft level lounge volume vote flush punch vanish casino fold cliff hollow maximum flip coast barrel copy quit globe";
  const privateKeyAddress = "0x7F2BE389E2b13DA09D325332E3cb718CD751B7C6";
  const expectedSignedMessage =
    "0x56caed36f96b601d64bc33a79be32da86e5c1119bc22e6d8c6d78c0cb6d127dc457a2186965186506100bb7172dbbffec437d9bd024e93782da03ca44e726c2d1b";

  const deviceInformation = createMock(DeviceInformation, {
    isEmulator: () => Promise.resolve(false),
    getPlatform: () => "ios",
  });

  const secureEnclave = new EthSecureEnclave(noopLogger, deviceInformation);

  describe("message signing flow", () => {
    it("should sign a digest with a given private key reference", async () => {
      const privateKeyReference = await secureEnclave.addSecret(privateKey);

      const signedMessage = await secureEnclave.signDigest(privateKeyReference, messageHash);

      expect(signedMessage).toBe(expectedSignedMessage);

      // expect private key to be in keychain
      const retrievedPrivateKey = await getInternetCredentials(privateKeyReference);

      if (retrievedPrivateKey) {
        expect(retrievedPrivateKey.password).toBe(privateKey);
      } else {
        throw Error("Keychain should return value.");
      }
    });

    it("should throw an error when no secret found", async () => {
      const privateKeyReference = toSecureReference("random reference");

      expect.assertions(1);

      try {
        await secureEnclave.signDigest(privateKeyReference, messageHash);
      } catch (e) {
        expect(e).toBeInstanceOf(NoSecretFoundError);
      }
    });

    it("should throw an error when secret is point to an invalid private key", async () => {
      const privateKeyReference = await secureEnclave.addSecret("invalid private key");

      expect.assertions(1);

      try {
        await secureEnclave.signDigest(privateKeyReference, messageHash);
      } catch (e) {
        expect(e).toBeInstanceOf(SecretNotAPrivateKeyError);
      }
    });
  });

  describe("address derivation flow", () => {
    it("should return a valid address assigned to the private key reference", async () => {
      const privateKeyReference = await secureEnclave.addSecret(privateKey);

      const address = await secureEnclave.getAddress(privateKeyReference);

      expect(address).toBe(privateKeyAddress);
    });

    it("should throw an error when no secret found", async () => {
      const privateKeyReference = toSecureReference("random reference");

      expect.assertions(1);

      try {
        await secureEnclave.getAddress(privateKeyReference);
      } catch (e) {
        expect(e).toBeInstanceOf(NoSecretFoundError);
      }
    });

    it("should throw an error when secret is point to an invalid private key", async () => {
      const privateKeyReference = await secureEnclave.addSecret("invalid private key");

      expect.assertions(1);

      try {
        await secureEnclave.getAddress(privateKeyReference);
      } catch (e) {
        expect(e).toBeInstanceOf(SecretNotAPrivateKeyError);
      }
    });
  });

  describe("random mnemonic creation flow", () => {
    it("should return a reference to a random mnemonic", async () => {
      const randomMnemonicsReferences = await Promise.all([
        secureEnclave.createRandomMnemonic(),
        secureEnclave.createRandomMnemonic(),
      ]);

      const mnemonics = await Promise.all(
        randomMnemonicsReferences.map(reference => secureEnclave.unsafeGetSecret(reference)),
      );

      expect(mnemonics.every(mnemonic => mnemonic !== null && isMnemonic(mnemonic))).toBeTruthy();
      // every mnemonic should be a random new one
      expect(mnemonics.length).toBe(new Set(mnemonics).size);
    });
  });

  describe("private key derivation flow", () => {
    const derivationPath = toEthereumHDPath("m/44'/60'/0'/0/0");

    it("should return a valid private key reference assigned to the mnemonic reference", async () => {
      const mnemonicKeyReference = await secureEnclave.addSecret(mnemonic);

      const privateKeyReference = await secureEnclave.deriveKey(
        mnemonicKeyReference,
        derivationPath,
      );

      const derivedPrivateKey = await secureEnclave.unsafeGetSecret(privateKeyReference);

      expect(derivedPrivateKey).toBe(privateKey);
    });

    it("should throw an error when no secret found", async () => {
      const mnemonicRandomReference = toSecureReference("random reference");

      expect.assertions(1);

      try {
        await secureEnclave.deriveKey(mnemonicRandomReference, derivationPath);
      } catch (e) {
        expect(e).toBeInstanceOf(NoSecretFoundError);
      }
    });

    it("should throw an error when secret is point to an invalid mnemonic", async () => {
      const mnemonicRandomReference = await secureEnclave.addSecret("invalid mnemonic key");

      expect.assertions(1);

      try {
        await secureEnclave.deriveKey(mnemonicRandomReference, derivationPath);
      } catch (e) {
        expect(e).toBeInstanceOf(SecretNotAMnemonicError);
      }
    });

    it("should throw an error when derivation path is not a valid one", async () => {
      const mnemonicKeyReference = await secureEnclave.addSecret(mnemonic);

      expect.assertions(1);

      try {
        await secureEnclave.deriveKey(mnemonicKeyReference, toEthereumHDPath("invalid hd path"));
      } catch (e) {
        expect(e).toBeInstanceOf(FailedToDerivePrivateKey);
      }
    });
  });

  describe("delete secret flow", () => {
    it("should delete a secret for a given reference", async () => {
      const mnemonicKeyReference = await secureEnclave.addSecret(mnemonic);

      await secureEnclave.unsafeDeleteSecret(mnemonicKeyReference);

      const receivedSecret = await secureEnclave.unsafeGetSecret(mnemonicKeyReference);

      expect(receivedSecret).toBeNull();

      const retrievedKeyChainEntry = await getInternetCredentials(mnemonicKeyReference);
      expect(retrievedKeyChainEntry).toBeNull();
    });

    it("should not throw even when a reference is invalid", async () => {
      const invalidKeyReference = toSecureReference("invalid secret reference");

      await secureEnclave.unsafeDeleteSecret(invalidKeyReference);

      const receivedSecret = await secureEnclave.unsafeGetSecret(invalidKeyReference);

      expect(receivedSecret).toBeNull();
    });
  });

  describe("add secret flow", () => {
    it("should generate a new reference every time", async () => {
      const references = [
        await secureEnclave.addSecret(mnemonic),
        await secureEnclave.addSecret(mnemonic),
        await secureEnclave.addSecret(mnemonic),
      ];

      // every reference should be a new one
      expect(references.length).toBe(new Set(references).size);
    });
  });
});
