import { coreModuleApi, ILogger } from "@neufund/shared-modules";
import {
  EthereumHDPath,
  EthereumAddressWithChecksum,
  toEthereumChecksumAddress,
} from "@neufund/shared-utils";
import { utils } from "ethers";
import { KeyPair } from "ethers/utils/secp256k1";
import { injectable, inject } from "inversify";

import { DeviceInformation } from "modules/device-information/DeviceInformation";
import { deviceInformationModuleApi } from "modules/device-information/module";
import { EthModuleError } from "modules/eth/errors";

import {
  ISecureStorage,
  TSecureReference,
  AsyncSecureStorage,
  KeychainSecureStorage,
} from "./SecureStorage";
import { isMnemonic, isPrivateKey } from "./utils";

class EthSecureEnclaveError extends EthModuleError {
  constructor(message: string) {
    super(`EthSecureEnclave: ${message}`);
  }
}

class NoSecretFoundError extends EthSecureEnclaveError {
  constructor() {
    super("No secret found for the given reference");
  }
}

class SecretNotAPrivateKeyError extends EthSecureEnclaveError {
  constructor() {
    super("Secret should be a private key");
  }
}

class SecretNotAMnemonicError extends EthSecureEnclaveError {
  constructor() {
    super("Secret should be a mnemonic");
  }
}

class FailedToDerivePrivateKey extends EthSecureEnclaveError {
  constructor(derivationPath: EthereumHDPath) {
    super(`Failed to derive private key for a path ${derivationPath}`);
  }
}

/**
 * A secure layer hiding all operations on mnemonic and private key
 *
 * @note In future will be replaced by a native code
 */
@injectable()
class EthSecureEnclave {
  private secureStorage: ISecureStorage | null = null;
  private readonly logger: ILogger;
  private readonly deviceInformation: DeviceInformation;

  constructor(
    @inject(coreModuleApi.symbols.logger) logger: ILogger,
    @inject(deviceInformationModuleApi.symbols.deviceInformation)
    deviceInformation: DeviceInformation,
  ) {
    this.logger = logger;
    this.deviceInformation = deviceInformation;
  }

  /**
   * Gets or creates the secures storage
   */
  async getStorage(): Promise<ISecureStorage> {
    if (this.secureStorage) {
      return this.secureStorage;
    }

    const platform = this.deviceInformation.getPlatform();
    // on the iOS simulator we have to simulate the storage, real devices and the android emulator
    // can emulate this
    const useAsyncStorageFallback =
      __DEV__ && (await this.deviceInformation.isEmulator()) && platform === "ios";

    if (useAsyncStorageFallback) {
      this.logger.info("Creating a non secure async storage");

      this.secureStorage = new AsyncSecureStorage();
    } else {
      this.logger.info("Creating a secure storage");

      // on android we can't use biometry at this moment, as there is a bug in react-native-keychain which
      // prevents it from working with the android face recognition. Once this is solved, biometry should
      // always be used.
      // https://github.com/oblador/react-native-keychain/issues/318
      const useBiometry = platform !== "android";
      this.secureStorage = new KeychainSecureStorage(useBiometry);
    }
    return this.secureStorage;
  }

  /**
   * Gets the secret from the SecureStorage.
   *
   * @note This operation is unsafe as it exposes secret to the device memory
   *
   * @param reference - A reference to the secret
   *
   * @returns A secret value saved under the provided reference
   */
  async unsafeGetSecret(reference: TSecureReference): Promise<string | null> {
    this.logger.info(`Retrieving secret for ref ${reference.substring(0, 4)}`);
    const storage = await this.getStorage();
    return storage.getSecret(reference);
  }

  /**
   * Removes the secret from the SecureStorage.
   * @param reference - A reference to the secret
   */
  async unsafeDeleteSecret(reference: TSecureReference): Promise<void> {
    this.logger.info(`Deleting secret for ref ${reference.substring(0, 4)}`);
    const storage = await this.getStorage();
    await storage.deleteSecret(reference);
  }

  /**
   * Saves secret in the secure hardware storage.
   *
   * @param secret - A secure to save in the SecureStorage
   *
   * @returns A reference to the secret
   */
  async addSecret(secret: string): Promise<TSecureReference> {
    const storage = await this.getStorage();
    const reference = await storage.setSecret(secret);
    this.logger.info(`Added secret for ref ${reference.substring(0, 4)}`);
    return reference;
  }

  /**
   * Returns an eth address for a given private key reference.
   **
   * @throws NoSecretFoundError - When no secret was found for a given reference
   * @throws SecretNotAPrivateKeyError - When provided secret is not a private key
   *
   * @param reference - Secret reference to the private key
   *
   */
  async getAddress(reference: TSecureReference): Promise<EthereumAddressWithChecksum> {
    this.logger.info(`Getting address for ref ${reference.substring(0, 4)}`);
    const secret = await this.unsafeGetSecret(reference);

    if (secret === null) {
      throw new NoSecretFoundError();
    }

    if (!isPrivateKey(secret)) {
      throw new SecretNotAPrivateKeyError();
    }

    return toEthereumChecksumAddress(utils.computeAddress(secret));
  }

  /**
   * For a given reference to the mnemonic returns a reference to the private key for a provided derivation path
   *
   * @throws NoSecretFoundError - When no secret was found for a given reference
   * @throws SecretNotAMnemonicError - When provided secret is not a mnemonic
   *
   * @param reference - A reference to the mnemonic
   * @param derivationPath - A derivation path to use for private key generation
   *
   * @returns A reference to the private key
   */
  async deriveKey(
    reference: TSecureReference,
    derivationPath: EthereumHDPath,
  ): Promise<TSecureReference> {
    const secret = await this.unsafeGetSecret(reference);

    if (secret === null) {
      throw new NoSecretFoundError();
    }

    if (!isMnemonic(secret)) {
      throw new SecretNotAMnemonicError();
    }

    try {
      const hdNode = utils.HDNode.fromMnemonic(secret).derivePath(derivationPath);
      return this.addSecret(hdNode.privateKey);
    } catch (e) {
      throw new FailedToDerivePrivateKey(derivationPath);
    }
  }

  /**
   * Signs the digest with a given reference to the private key.
   *
   * @throws NoSecretFoundError - When no secret was found for a given reference
   *
   * @param reference - A reference to the private key
   * @param digest - A keccak256 digest of a message to sign
   *
   * @returns The flat-format signed signature
   */
  async signDigest(reference: TSecureReference, digest: string): Promise<string> {
    const secret = await this.unsafeGetSecret(reference);

    if (secret === null) {
      throw new NoSecretFoundError();
    }

    if (!isPrivateKey(secret)) {
      throw new SecretNotAPrivateKeyError();
    }

    const keyPair = new KeyPair(secret);

    const signature = keyPair.sign(digest);

    return utils.joinSignature(signature);
  }

  /**
   * Creates a new random mnemonic
   *
   * @returns A reference to a randomly created mnemonic
   */
  async createRandomMnemonic(): Promise<TSecureReference> {
    // 32 bytes equals to 24 words
    const BYTES_IN_WORDS = 32;
    const bytes = utils.randomBytes(BYTES_IN_WORDS);

    const randomMnemonic = utils.HDNode.entropyToMnemonic(bytes);

    return this.addSecret(randomMnemonic);
  }
}

export {
  EthSecureEnclave,
  NoSecretFoundError,
  SecretNotAPrivateKeyError,
  SecretNotAMnemonicError,
  EthSecureEnclaveError,
  FailedToDerivePrivateKey,
};
