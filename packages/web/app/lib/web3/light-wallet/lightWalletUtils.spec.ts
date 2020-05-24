import { expectToBeRejected } from "@neufund/shared-utils/tests";
import { expect } from "chai";

import {
  createLightWalletVault,
  deserializeLightWalletVault,
  encryptString,
  getWalletKey,
  getWalletKeyFromSaltAndPassword,
} from "./LightWalletUtils";

describe("LightWallet > cryptography", () => {
  const hdPathString = "m/44'/60'/0'";
  const password = "password";
  const customSalt = "salt";
  const expectedSeed =
    "author foster awkward faint script unique letter tag meadow garment elite drip";
  const expectedPrivKey = "f75adef587eeb81c12541f1a9f1ea93cf8ac433ca1d83df18d057fa2a870b293";

  describe("Lightwallet Operations", () => {
    describe("Create LightWallet", () => {
      it("should create a new serialized wallet", async () => {
        const serializedLightWallet = await createLightWalletVault({
          password,
          hdPathString,
          customSalt,
        });

        expect(serializedLightWallet.serializedLightWallet).to.deep.include("addresses");
        expect(serializedLightWallet.serializedLightWallet).to.deep.include("encHdRootPriv");
        expect(serializedLightWallet.serializedLightWallet).to.deep.include("encPrivKeys");
        expect(serializedLightWallet.serializedLightWallet).to.deep.include("encSeed");
        expect(serializedLightWallet.serializedLightWallet).to.deep.include("hdIndex");
        expect(serializedLightWallet.serializedLightWallet).to.deep.include("hdPathString");
        expect(serializedLightWallet.salt).to.equal("salt");
      });

      it("should deserialize a lightWallet instance", async () => {
        const walletInstance = (
          await createLightWalletVault({
            password,
            hdPathString,
          })
        ).serializedLightWallet;
        const deserializedInstance = deserializeLightWalletVault(walletInstance, "salt");
        expect(deserializedInstance).to.deep.include(JSON.parse(walletInstance));
      });

      it("should return correct private key", async () => {
        const walletInstance = (
          await createLightWalletVault({
            password,
            hdPathString,
            recoverSeed: expectedSeed,
            customSalt,
          })
        ).serializedLightWallet;
        const deserializedInstance = deserializeLightWalletVault(walletInstance, customSalt);

        const fetchedSeed = deserializedInstance.exportPrivateKey(
          deserializedInstance.addresses[0],
          await getWalletKey(deserializedInstance, password),
        );

        expect(fetchedSeed).to.equal(expectedPrivKey);
      });

      it("should return correct seed", async () => {
        const walletInstance = (
          await createLightWalletVault({
            password,
            hdPathString,
            recoverSeed: expectedSeed,
            customSalt,
          })
        ).serializedLightWallet;
        const deserializedInstance = deserializeLightWalletVault(walletInstance, customSalt);

        const fetchedSeed = deserializedInstance.getSeed(
          await getWalletKey(deserializedInstance, password),
        );

        expect(fetchedSeed).to.equal(expectedSeed);
      });
    });

    describe("Recover LightWallet", () => {
      it("should recover a 24 word mnemonic and generate a nano compatible BIP39", async () => {
        const recoverSeed =
          "butter clean pledge exist gym busy shove pyramid cereal bird unique bar anger hazard weapon shoe clog possible spider convince object mind beef music";
        const expectedAddress = "07dc3a64a5fd98d23776c54f02c53d0a28b61515";

        const lightWalletObject = await createLightWalletVault({
          password,
          hdPathString,
          recoverSeed,
        });
        const walletInstance = JSON.parse(lightWalletObject.serializedLightWallet);

        expect(walletInstance.addresses[0]).to.equal(expectedAddress);
      });

      it("should recover a 12 word mnemonic and a BIP44 compatible derivation path", async () => {
        const recoverSeed =
          "author foster awkward faint script unique letter tag meadow garment elite drip";
        const expectedAddress = "47fde38dc660f9d935c41b4f3a2a6e62d2e823eb";

        const lightWalletObject = await createLightWalletVault({
          password,
          hdPathString,
          recoverSeed,
        });
        const walletInstance = JSON.parse(lightWalletObject.serializedLightWallet);

        expect(walletInstance.addresses[0]).to.equal(expectedAddress);
      });
    });

    describe("Unlock/Use LightWallet", () => {
      it("should unlock the lightwallet if salt and password are correct", async () => {
        const walletInstance = (
          await createLightWalletVault({
            password,
            hdPathString,
            recoverSeed: expectedSeed,
            customSalt,
          })
        ).serializedLightWallet;
        const deserializedInstance = deserializeLightWalletVault(walletInstance, customSalt);
        const obtainedSeed = deserializedInstance.getSeed(
          await getWalletKey(deserializedInstance, password),
        );

        expect(obtainedSeed).to.equal(expectedSeed);
      });

      it("should throw if salt is not correct", async () => {
        const walletInstance = (
          await createLightWalletVault({
            password,
            hdPathString,
            recoverSeed: expectedSeed,
            customSalt,
          })
        ).serializedLightWallet;
        const deserializedInstance = deserializeLightWalletVault(walletInstance, "wrongsalt");

        await expectToBeRejected(
          async () =>
            deserializedInstance.getSeed(await getWalletKey(deserializedInstance, password)),
          new Error("Incorrect derived key!"),
        );
      });

      it("should throw if password is not correct", async () => {
        const walletInstance = (
          await createLightWalletVault({
            password,
            hdPathString,
            recoverSeed: expectedSeed,
            customSalt,
          })
        ).serializedLightWallet;
        const deserializedInstance = deserializeLightWalletVault(walletInstance, customSalt);

        await expectToBeRejected(
          async () =>
            deserializedInstance.getSeed(await getWalletKey(deserializedInstance, "wrongpassword")),
          new Error("Incorrect derived key!"),
        );
      });
    });
  });

  describe("Key generations/ String Encoding", () => {
    it("Should generate a 64 byte key", async () => {
      const genKey = await getWalletKeyFromSaltAndPassword("salt", "password", 64);

      expect(genKey.length).to.equal(64);
    });

    it("should deterministically encrypt then encode a string if given the same key", async () => {
      const genKey = await getWalletKeyFromSaltAndPassword("salt", "password", 64);

      const encodedKey = encryptString({ string: "test", pwDerivedKey: genKey });
      const encodedKey2 = encryptString({ string: "test", pwDerivedKey: genKey });

      expect(encodedKey).to.deep.equal(encodedKey2);
    });
  });
});
