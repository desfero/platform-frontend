import {
  EthereumHDPath,
  EthereumAddressWithChecksum,
  toEthereumChecksumAddress,
} from "@neufund/shared-utils";
import { utils } from "ethers";
import { KeyPair } from "ethers/utils/secp256k1";
import { injectable, inject } from "inversify";

import { EthModuleError } from "../errors";
import { SecureStorage, TSecureReference } from "./SecureStorage";
import { isMnemonic, isPrivateKey } from "./utils";
import { deviceInformationModuleApi } from "../../device-information/module";
import { DeviceInformation } from "../../device-information/DeviceInformation";

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
  private readonly secureStorage: SecureStorage;

  constructor(
    @inject(deviceInformationModuleApi.symbols.deviceInformation)
    deviceInformation: DeviceInformation,
  ) {
    const useAsyncStorageFallback = deviceInformation.isEmulator && __DEV__;
    this.secureStorage = new SecureStorage(useAsyncStorageFallback);
  }

  /**
   * Get's the secret from the SecureStorage.
   *
   * @note This operation is unsafe as it exposes secret to the device memory
   *
   * @param reference - A reference to the secret
   *
   * @returns A secret value saved under the provided reference
   */
  unsafeGetSecret(reference: TSecureReference): Promise<string | null> {
    return this.secureStorage.getSecret(reference);
  }

  /**
   * Removes the secret from the SecureStorage.
   * @param reference - A reference to the secret
   */
  async unsafeDeleteSecret(reference: TSecureReference): Promise<void> {
    await this.secureStorage.deleteSecret(reference);
  }

  /**
   * Saves secret in the secure hardware storage.
   *
   * @param secret - A secure to save in the SecureStorage
   *
   * @returns A reference to the secret
   */
  async addSecret(secret: string): Promise<TSecureReference> {
    return await this.secureStorage.setSecret(secret);
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
    const bytes = utils.randomBytes(32);

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
