import { coreModuleApi, ILogger } from "@neufund/shared-modules";
import {
  EthereumPrivateKey,
  toEthereumPrivateKey,
  EthereumHDMnemonic,
  toEthereumHDMnemonic,
} from "@neufund/shared-utils";
import { utils } from "ethers";
import { UnsignedTransaction } from "ethers/utils";
import { interfaces } from "inversify";

import { EthModuleError } from "modules/eth/errors";

import { EthSecureEnclave } from "./EthSecureEnclave";
import { TWalletMetadata } from "./schemas";
import { privateSymbols } from "./symbols";
import { addHexPrefix, isHdWallet } from "./utils";

class EthWalletError extends EthModuleError {
  constructor(message: string) {
    super(`EthWalletError: ${message}`);
  }
}

class NoPrivateKeyFoundError extends EthWalletError {
  constructor() {
    super("No private key found for the given reference");
  }
}

class NoMnemonicFoundError extends EthWalletError {
  constructor() {
    super("No mnemonic found for the given reference");
  }
}

class NotAnHDWalletError extends EthWalletError {
  constructor() {
    super("Not an HD wallet");
  }
}

/**
 * Wraps ethers wallet under custom object to expose only singing related functionality.
 *
 * @note Think of EthWallet as a cold wallet with no access to the network.
 *
 * @internal EthWallet should only be used in EthWalletFactory and never exposed to DI container
 */
class EthWallet {
  public readonly walletMetadata: TWalletMetadata;
  private readonly ethSecureEnclave: EthSecureEnclave;
  private readonly logger: ILogger;

  constructor(
    walletMetadata: TWalletMetadata,
    ethSecureEnclave: EthSecureEnclave,
    logger: ILogger,
  ) {
    this.walletMetadata = walletMetadata;
    this.ethSecureEnclave = ethSecureEnclave;
    this.logger = logger;
  }

  /**
   * Signs an already hashed message
   *
   * @param messageHash - A hash of message (should be an ethereum prefixed message hash)
   *
   * @returns A signed message
   */
  async signMessageHash(messageHash: string): Promise<string> {
    this.logger.info("Signing message hash");

    return this.ethSecureEnclave.signDigest(this.walletMetadata.privateKeyReference, messageHash);
  }

  /**
   * Signs a message
   *
   * @param message - A message
   *
   * @returns A signed message
   */
  async signMessage(message: string): Promise<string> {
    this.logger.info("Signing message");

    const digest = utils.hashMessage(utils.arrayify(addHexPrefix(message)));

    return this.ethSecureEnclave.signDigest(this.walletMetadata.privateKeyReference, digest);
  }

  /**
   * Signs a transaction
   *
   * @param transaction - A transaction
   *
   * @returns - A signed serialized transaction
   */
  async signTransaction(transaction: UnsignedTransaction): Promise<string> {
    this.logger.info("Signing transaction");

    const rawTx = utils.serializeTransaction(transaction);

    const signature = await this.ethSecureEnclave.signDigest(
      this.walletMetadata.privateKeyReference,
      utils.keccak256(rawTx),
    );

    this.logger.info("Transaction signed");

    return utils.serializeTransaction(transaction, signature);
  }

  /**
   * Exports a private key
   *
   * @note This operation is unsafe as private key is exposed to the UI
   *        therefore put without any encryption to the RAM memory
   *
   * @returns A private key of a give wallet
   *
   */
  async unsafeExportPrivateKey(): Promise<EthereumPrivateKey> {
    this.logger.info(`Exporting private key for a wallet ${this.walletMetadata.address}`);

    const privateKey = await this.ethSecureEnclave.unsafeGetSecret(
      this.walletMetadata.privateKeyReference,
    );

    if (privateKey === null) {
      throw new NoPrivateKeyFoundError();
    }

    this.logger.info(`Private key for a wallet ${this.walletMetadata.address} was exported`);

    return toEthereumPrivateKey(privateKey);
  }

  /**
   * Exports a mnemonic
   *
   * @throws NotAnHDWalletError when wallet is not an HD wallet
   *
   * @note This operation is unsafe as mnemonic is exposed to the UI
   *        therefore put without any encryption to the RAM memory
   *
   * @returns A mnemonic of a give wallet
   *
   */
  async unsafeExportMnemonic(): Promise<EthereumHDMnemonic> {
    if (!isHdWallet(this.walletMetadata)) {
      throw new NotAnHDWalletError();
    }

    this.logger.info(`Exporting mnemonic for a wallet ${this.walletMetadata.address}`);

    const mnemonic = await this.ethSecureEnclave.unsafeGetSecret(
      this.walletMetadata.mnemonicReference,
    );

    if (mnemonic === null) {
      throw new NoMnemonicFoundError();
    }

    this.logger.info(`Mnemonic for a wallet ${this.walletMetadata.address} was exported`);

    return toEthereumHDMnemonic(mnemonic);
  }
}

const ethWalletProvider = (context: interfaces.Context) => {
  const logger = context.container.get<ILogger>(coreModuleApi.symbols.logger);
  const ethSecureEnclave = context.container.get<EthSecureEnclave>(privateSymbols.ethSecureEnclave);

  return (walletMetadata: TWalletMetadata) =>
    new EthWallet(walletMetadata, ethSecureEnclave, logger);
};

export type TEthWalletProviderType = ReturnType<typeof ethWalletProvider>;

export {
  EthWallet,
  ethWalletProvider,
  NoPrivateKeyFoundError,
  NoMnemonicFoundError,
  NotAnHDWalletError,
};
