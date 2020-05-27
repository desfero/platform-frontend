import { noopLogger } from "@neufund/shared-modules";
import { toEthereumChecksumAddress, toEthereumHDPath } from "@neufund/shared-utils";

import { createMock } from "utils/testUtils.specUtils";

import { EthSecureEnclave } from "./EthSecureEnclave";
import {
  EthWallet,
  NoMnemonicFoundError,
  NoPrivateKeyFoundError,
  NotAnHDWalletError,
} from "./EthWallet";
import { toSecureReference } from "./SecureStorage";
import { EWalletType } from "./types";

describe("EthWallet", () => {
  const privateKeyWalletMetadata = {
    type: EWalletType.PRIVATE_KEY_WALLET,
    address: toEthereumChecksumAddress("0x429123b08DF32b0006fd1F3b0Ef893A8993802f3"),
    privateKeyReference: toSecureReference("1"),
  } as const;

  const hdWalletMetadata = {
    type: EWalletType.HD_WALLET,
    address: toEthereumChecksumAddress("0x429123b08DF32b0006fd1F3b0Ef893A8993802f3"),
    mnemonicReference: toSecureReference("0"),
    privateKeyReference: toSecureReference("1"),
    derivationPath: toEthereumHDPath("m/44'/60'/0'/0"),
  } as const;

  describe("signMessageHash", () => {
    it("should sign a message with a given private key reference", async () => {
      const messageHash = "0xc7595adb6684bd03eb6ee54f10b0224e4bcfdaa5d393187583eb1777ae169d80";
      const expectedSignedMessage =
        "0x96a06a251fe4e064c8e094613879fea327023dc4937ead182e83697b…91cdfd86d14a1845b5a2231529f1355c1a9f5f85bee657a91a700d01b";

      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        signDigest: () => Promise.resolve(expectedSignedMessage),
      });

      const ethWallet = new EthWallet(hdWalletMetadata, ethSecureEnclaveMock, noopLogger);

      const signedMessage = await ethWallet.signMessageHash(messageHash);

      expect(ethSecureEnclaveMock.signDigest).toBeCalledWith(
        hdWalletMetadata.privateKeyReference,
        messageHash,
      );
      expect(signedMessage).toBe(expectedSignedMessage);
    });
  });

  describe("signMessage", () => {
    it("should sign a message with a given private key reference", async () => {
      const message = "c7595adb6684bd03eb6ee54f10b0224e4bcfdaa5d393187583eb1777ae169d80";
      const messageHash = "0xca520013afb08162550e1d69209e422b224c3a27432890f47bd515c328cda2e5";
      const expectedSignedMessage =
        "0x96a06a251fe4e064c8e094613879fea327023dc4937ead182e83697b…91cdfd86d14a1845b5a2231529f1355c1a9f5f85bee657a91a700d01b";

      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        signDigest: () => Promise.resolve(expectedSignedMessage),
      });

      const ethWallet = new EthWallet(hdWalletMetadata, ethSecureEnclaveMock, noopLogger);

      const signedMessage = await ethWallet.signMessage(message);

      expect(ethSecureEnclaveMock.signDigest).toBeCalledWith(
        hdWalletMetadata.privateKeyReference,
        messageHash,
      );
      expect(signedMessage).toBe(expectedSignedMessage);
    });
  });

  describe("signTransaction", () => {
    it("should sign a transaction with a given private key reference", async () => {
      const transaction = {
        to: "0x7824e49353BD72E20B61717cf82a06a4EEE209e8",
        gasLimit: "0x21000",
        gasPrice: "0x20000000000",
        value: "0x1000000000000000000",
      };
      const transactionKeccak =
        "0xef8135b681fa4eea2f9827625dbd67d54e165a895ca66c4daed600e9c8162b38";
      const transactionSignature =
        "0x96a06a251fe4e064c8e094613879fea327023dc4937ead182e83697b3b46403148960678c91cdfd86d14a1845b5a2231529f1355c1a9f5f85bee657a91a700d01b";
      const expectedSignedTransaction =
        "0xf870808602000000000083021000947824e49353bd72e20b61717cf82a06a4eee209e88a01000000000000000000801ba096a06a251fe4e064c8e094613879fea327023dc4937ead182e83697b3b464031a048960678c91cdfd86d14a1845b5a2231529f1355c1a9f5f85bee657a91a700d0";

      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        signDigest: () => Promise.resolve(transactionSignature),
      });

      const ethWallet = new EthWallet(hdWalletMetadata, ethSecureEnclaveMock, noopLogger);

      const signedTransaction = await ethWallet.signTransaction(transaction);

      expect(ethSecureEnclaveMock.signDigest).toBeCalledWith(
        hdWalletMetadata.privateKeyReference,
        transactionKeccak,
      );
      expect(signedTransaction).toBe(expectedSignedTransaction);
    });
  });

  describe("unsafeExportPrivateKey", () => {
    it("should export a private key for a given private key reference", async () => {
      const expectedPrivateKey =
        "0x79177f5833b64c8fdcc9862f5a779b8ff0e1853bf6e9e4748898d4b6de7e8c93";
      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        unsafeGetSecret: () => Promise.resolve(expectedPrivateKey),
      });

      const ethWallet = new EthWallet(privateKeyWalletMetadata, ethSecureEnclaveMock, noopLogger);

      const privateKey = await ethWallet.unsafeExportPrivateKey();

      expect(ethSecureEnclaveMock.unsafeGetSecret).toBeCalledWith(
        privateKeyWalletMetadata.privateKeyReference,
      );
      expect(privateKey).toBe(expectedPrivateKey);
    });

    it("should throw an error when private key not found for a given reference", async () => {
      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        unsafeGetSecret: () => Promise.resolve(null),
      });

      const ethWallet = new EthWallet(privateKeyWalletMetadata, ethSecureEnclaveMock, noopLogger);

      expect.assertions(1);

      try {
        await ethWallet.unsafeExportPrivateKey();
      } catch (e) {
        expect(e).toBeInstanceOf(NoPrivateKeyFoundError);
      }
    });
  });

  describe("unsafeExportMnemonic", () => {
    it("should export a mnemonic for a given mnemonic reference", async () => {
      const expectedMnemonic =
        "timber rely gap brown useful craft level lounge volume vote flush punch vanish casino fold cliff hollow maximum flip coast barrel copy quit globe";
      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        unsafeGetSecret: () => Promise.resolve(expectedMnemonic),
      });

      const ethWallet = new EthWallet(hdWalletMetadata, ethSecureEnclaveMock, noopLogger);

      const mnemonic = await ethWallet.unsafeExportMnemonic();

      expect(ethSecureEnclaveMock.unsafeGetSecret).toBeCalledWith(
        hdWalletMetadata.mnemonicReference,
      );
      expect(mnemonic).toBe(expectedMnemonic);
    });

    it("should throw an error when trying to export mnemonic for a private key wallet", async () => {
      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        unsafeGetSecret: () => Promise.resolve(null),
      });

      const ethWallet = new EthWallet(privateKeyWalletMetadata, ethSecureEnclaveMock, noopLogger);

      expect.assertions(1);

      try {
        await ethWallet.unsafeExportMnemonic();
      } catch (e) {
        expect(e).toBeInstanceOf(NotAnHDWalletError);
      }
    });

    it("should throw an error when mnemonic not found for a given reference", async () => {
      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        unsafeGetSecret: () => Promise.resolve(null),
      });

      const ethWallet = new EthWallet(hdWalletMetadata, ethSecureEnclaveMock, noopLogger);

      expect.assertions(1);

      try {
        await ethWallet.unsafeExportMnemonic();
      } catch (e) {
        expect(e).toBeInstanceOf(NoMnemonicFoundError);
      }
    });
  });
});
