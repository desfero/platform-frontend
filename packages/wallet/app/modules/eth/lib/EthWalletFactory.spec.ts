import { noopLogger } from "@neufund/shared-modules";
import {
  toEthereumPrivateKey,
  toEthereumChecksumAddress,
  toEthereumHDMnemonic,
  toEthereumHDPath,
} from "@neufund/shared-utils";

import { createMock } from "../../../utils/testUtils.specUtils";
import { AppSingleKeyStorage } from "../../storage";
import { EthSecureEnclave } from "./EthSecureEnclave";
import { EthWallet } from "./EthWallet";
import { EthWalletFactory, NoExistingWalletFoundError } from "./EthWalletFactory";
import { toSecureReference, TSecureReference } from "./SecureStorage";
import { THDWalletMetadata, TPrivateKeyWalletMetadata, TWalletMetadata } from "./schemas";
import { EWalletType } from "./types";

const hdWalletMetadata: THDWalletMetadata = {
  type: EWalletType.HD_WALLET,
  address: toEthereumChecksumAddress("0x429123b08DF32b0006fd1F3b0Ef893A8993802f3"),
  mnemonicReference: toSecureReference("0"),
  privateKeyReference: toSecureReference("1"),
  derivationPath: toEthereumHDPath("m/44'/60'/0'/0"),
};

const privateKeyWalletMetadata: TPrivateKeyWalletMetadata = {
  type: EWalletType.PRIVATE_KEY_WALLET,
  address: toEthereumChecksumAddress("0x429123b08DF32b0006fd1F3b0Ef893A8993802f3"),
  privateKeyReference: toSecureReference("0"),
};

describe("EthWalletFactory", () => {
  const emptyEthSecureEnclaveMock = createMock(EthSecureEnclave, {});
  const emptyEthWalletProviderMock = jest.fn();

  describe("hasExistingWallet", () => {
    it("should return false when no metadata found", async () => {
      const walletStorageMock = createMock<AppSingleKeyStorage<TWalletMetadata>>(
        AppSingleKeyStorage,
        {
          get: () => Promise.resolve(undefined),
        },
      );

      const ethWalletFactory = new EthWalletFactory(
        walletStorageMock,
        noopLogger,
        emptyEthSecureEnclaveMock,
        emptyEthWalletProviderMock,
      );

      const hasExistingWallet = await ethWalletFactory.hasExistingWallet();

      expect(hasExistingWallet).toBeFalsy();
    });

    it("should return true when metadata found", async () => {
      const walletStorageMock = createMock<AppSingleKeyStorage<TWalletMetadata>>(
        AppSingleKeyStorage,
        {
          get: () => Promise.resolve(privateKeyWalletMetadata),
        },
      );

      const ethWalletFactory = new EthWalletFactory(
        walletStorageMock,
        noopLogger,
        emptyEthSecureEnclaveMock,
        emptyEthWalletProviderMock,
      );

      const hasExistingWallet = await ethWalletFactory.hasExistingWallet();

      expect(hasExistingWallet).toBeTruthy();
    });
  });

  describe("createFromExisting", () => {
    it("should throw no existing wallet found error when trying to create without metadata", async () => {
      const walletStorageMock = createMock<AppSingleKeyStorage<TWalletMetadata>>(
        AppSingleKeyStorage,
        {
          get: () => Promise.resolve(undefined),
        },
      );

      const ethWalletFactory = new EthWalletFactory(
        walletStorageMock,
        noopLogger,
        emptyEthSecureEnclaveMock,
        emptyEthWalletProviderMock,
      );

      expect.assertions(1);

      try {
        await ethWalletFactory.createFromExisting();
      } catch (e) {
        expect(e).toBeInstanceOf(NoExistingWalletFoundError);
      }
    });

    it("should return new wallet when wallet metadata are available", async () => {
      const walletStorageMock = createMock<AppSingleKeyStorage<TWalletMetadata>>(
        AppSingleKeyStorage,
        {
          get: () => Promise.resolve(privateKeyWalletMetadata),
        },
      );
      const ethWallet = createMock(EthWallet, {});
      const ethWalletProviderMock = jest.fn(() => ethWallet);

      const ethWalletFactory = new EthWalletFactory(
        walletStorageMock,
        noopLogger,
        emptyEthSecureEnclaveMock,
        ethWalletProviderMock,
      );

      const wallet = await ethWalletFactory.createFromExisting();

      expect(wallet).toBe(ethWallet);
    });
  });

  describe("createFromPrivateKey", () => {
    it("should create a wallet from private key", async () => {
      const secretStorage: string[] = [];
      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        addSecret: (secret: string) => {
          const length = secretStorage.length;
          secretStorage[length] = secret;
          return Promise.resolve(toSecureReference(length.toString()));
        },
        getAddress: (secretReference: TSecureReference) => {
          if (secretStorage[parseInt(secretReference, 10)]) {
            return Promise.resolve(privateKeyWalletMetadata.address);
          }

          throw new Error("Invalid secret reference");
        },
      });

      const walletStorageMock = createMock<AppSingleKeyStorage<TWalletMetadata>>(
        AppSingleKeyStorage,
        {
          set: jest.fn(),
        },
      );

      const ethWallet = createMock(EthWallet, {});
      const ethWalletProviderMock = jest.fn(() => ethWallet);

      const ethWalletFactory = new EthWalletFactory(
        walletStorageMock,
        noopLogger,
        ethSecureEnclaveMock,
        ethWalletProviderMock,
      );

      const privateKey = toEthereumPrivateKey(
        "0x79177f5833b64c8fdcc9862f5a779b8ff0e1853bf6e9e4748898d4b6de7e8c93",
      );
      const wallet = await ethWalletFactory.createFromPrivateKey(privateKey);

      expect(walletStorageMock.set).toBeCalledWith(privateKeyWalletMetadata);
      expect(ethWalletProviderMock).toBeCalledWith(privateKeyWalletMetadata);
      expect(wallet).toBe(ethWallet);
    });
  });

  describe("createFromMnemonic", () => {
    it("should create a wallet from mnemonic", async () => {
      const secretStorage: string[] = [];
      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        addSecret: (secret: string) => {
          const length = secretStorage.length;
          secretStorage[length] = secret;
          return Promise.resolve(toSecureReference(length.toString()));
        },
        getAddress: (secretReference: TSecureReference) => {
          if (secretStorage[parseInt(secretReference, 10)]) {
            return Promise.resolve(hdWalletMetadata.address);
          }

          throw new Error("Invalid secret reference");
        },
        deriveKey: () => {
          const length = secretStorage.length;
          secretStorage[length] = "generatedPrivateKey";
          return Promise.resolve(toSecureReference(length.toString()));
        },
      });

      const walletStorageMock = createMock<AppSingleKeyStorage<TWalletMetadata>>(
        AppSingleKeyStorage,
        {
          set: jest.fn(),
        },
      );

      const ethWallet = createMock(EthWallet, {});
      const ethWalletProviderMock = jest.fn(() => ethWallet);

      const ethWalletFactory = new EthWalletFactory(
        walletStorageMock,
        noopLogger,
        ethSecureEnclaveMock,
        ethWalletProviderMock,
      );

      const mnemonic = toEthereumHDMnemonic(
        "timber rely gap brown useful craft level lounge volume vote flush punch vanish casino fold cliff hollow maximum flip coast barrel copy quit globe",
      );
      const wallet = await ethWalletFactory.createFromMnemonic(mnemonic);

      expect(walletStorageMock.set).toBeCalledWith(hdWalletMetadata);
      expect(ethWalletProviderMock).toBeCalledWith(hdWalletMetadata);
      expect(wallet).toBe(ethWallet);
    });
  });

  describe("createRandom", () => {
    it("should create a random wallet", async () => {
      const secretStorage: string[] = [];
      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        createRandomMnemonic: () => {
          const length = secretStorage.length;
          secretStorage[length] = "some random mnemonic";
          return Promise.resolve(toSecureReference(length.toString()));
        },
        getAddress: (secretReference: TSecureReference) => {
          if (secretStorage[parseInt(secretReference, 10)]) {
            return Promise.resolve(hdWalletMetadata.address);
          }

          throw new Error("Invalid secret reference");
        },
        deriveKey: () => {
          const length = secretStorage.length;
          secretStorage[length] = "generatedPrivateKey";
          return Promise.resolve(toSecureReference(length.toString()));
        },
      });

      const walletStorageMock = createMock<AppSingleKeyStorage<TWalletMetadata>>(
        AppSingleKeyStorage,
        {
          set: jest.fn(),
        },
      );

      const ethWallet = createMock(EthWallet, {});
      const ethWalletProviderMock = jest.fn(() => ethWallet);

      const ethWalletFactory = new EthWalletFactory(
        walletStorageMock,
        noopLogger,
        ethSecureEnclaveMock,
        ethWalletProviderMock,
      );

      const wallet = await ethWalletFactory.createRandom();

      expect(walletStorageMock.set).toBeCalledWith(hdWalletMetadata);
      expect(ethWalletProviderMock).toBeCalledWith(hdWalletMetadata);
      expect(wallet).toBe(ethWallet);
    });
  });

  describe("unsafeDeleteWallet", () => {
    it("should delete existing hd wallet", async () => {
      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        unsafeDeleteSecret: jest.fn(),
      });
      const walletStorageMock = createMock<AppSingleKeyStorage<TWalletMetadata>>(
        AppSingleKeyStorage,
        {
          clear: jest.fn(),
        },
      );

      const ethWallet = createMock(EthWallet, {
        walletMetadata: hdWalletMetadata,
      });

      const ethWalletFactory = new EthWalletFactory(
        walletStorageMock,
        noopLogger,
        ethSecureEnclaveMock,
        emptyEthWalletProviderMock,
      );

      await ethWalletFactory.unsafeDeleteWallet(ethWallet);

      expect(ethSecureEnclaveMock.unsafeDeleteSecret).toBeCalledWith(
        hdWalletMetadata.privateKeyReference,
      );
      expect(ethSecureEnclaveMock.unsafeDeleteSecret).toBeCalledWith(
        hdWalletMetadata.mnemonicReference,
      );
      expect(walletStorageMock.clear).toBeCalledWith();
    });

    it("should delete existing private key wallet", async () => {
      const ethSecureEnclaveMock = createMock(EthSecureEnclave, {
        unsafeDeleteSecret: jest.fn(),
      });
      const walletStorage = createMock<AppSingleKeyStorage<TWalletMetadata>>(AppSingleKeyStorage, {
        clear: jest.fn(),
      });

      const ethWallet = createMock(EthWallet, {
        walletMetadata: privateKeyWalletMetadata,
      });

      const ethWalletFactory = new EthWalletFactory(
        walletStorage,
        noopLogger,
        ethSecureEnclaveMock,
        emptyEthWalletProviderMock,
      );

      await ethWalletFactory.unsafeDeleteWallet(ethWallet);

      expect(ethSecureEnclaveMock.unsafeDeleteSecret).toBeCalledWith(
        privateKeyWalletMetadata.privateKeyReference,
      );
      expect(walletStorage.clear).toBeCalledWith();
    });
  });
});
