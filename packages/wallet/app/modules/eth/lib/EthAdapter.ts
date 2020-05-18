import { coreModuleApi, ILogger } from "@neufund/shared-modules";
import {
  EthereumAddressWithChecksum,
  EthereumName,
  toEthereumChecksumAddress,
} from "@neufund/shared-utils";
import { providers, utils } from "ethers";
import { interfaces } from "inversify";

import { EBlockTag, ITransactionResponse } from "./types";

/**
 * Layer on top of ethers provider.
 * Simplifies the API and wraps it with our custom opaque types for increased type safety.
 *
 * @note All calls to eth node should go thought adapter.
 * @internal EthAdapter should only be used in EthManager and never exposed to DI container
 */
class EthAdapter {
  private readonly provider: providers.Provider;

  constructor(private readonly logger: ILogger, rpcUrl: string) {
    this.provider = new providers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Resolves an ENS name to an ETH address
   *
   * @param addressOrName
   *
   * @returns An ETH address
   */
  resolveName(
    addressOrName: EthereumAddressWithChecksum | EthereumName,
  ): Promise<EthereumAddressWithChecksum> {
    this.logger.info(`Resolving a name for ${addressOrName}`);

    return this.provider.resolveName(addressOrName).then(toEthereumChecksumAddress);
  }

  /**
   * Resolves current chain id
   */
  async getChainId(): Promise<number> {
    this.logger.info("Getting current chain id");

    const { chainId } = await this.provider.getNetwork();

    return chainId;
  }

  /**
   * Returns the current ETH balance of a given address.
   *
   * @param addressOrName - An ethereum address or ENS name
   */
  getBalance(addressOrName: EthereumAddressWithChecksum | EthereumName): Promise<utils.BigNumber> {
    this.logger.info(`Resolving a balance for ${addressOrName}`);

    return this.provider.getBalance(addressOrName);
  }

  /**
   * Returns the current transaction count counting from the latest block tag.
   *
   * @param addressOrName - An ethereum address or ENS name
   */
  getTransactionCountFromLatest(
    addressOrName: EthereumAddressWithChecksum | EthereumName,
  ): Promise<number> {
    this.logger.info(`Getting a transaction count from latest for ${addressOrName}`);

    return this.provider.getTransactionCount(addressOrName, EBlockTag.LATEST);
  }

  /**
   * Returns the current transaction count counting from the pending block tag.
   *
   * @param addressOrName - An ethereum address or ENS name
   */
  getTransactionCountFromPending(
    addressOrName: EthereumAddressWithChecksum | EthereumName,
  ): Promise<number> {
    this.logger.info(`Getting a transaction count from pending for ${addressOrName}`);

    return this.provider.getTransactionCount(addressOrName, EBlockTag.PENDING);
  }

  /**
   * Sends already singed transaction to the node
   *
   * @param signedTransaction - A singed transaction
   */
  sendTransaction(signedTransaction: string): Promise<ITransactionResponse> {
    this.logger.info(`Sending signed transaction`);

    return this.provider.sendTransaction(signedTransaction);
  }

  /**
   * Returns an internal provider to be used in contracts
   */
  async getInternalProvider(): Promise<providers.Provider> {
    this.logger.info(`Returning ethers provider`);

    return this.provider;
  }
}

const ethAdapterFactory = (context: interfaces.Context) => {
  const logger = context.container.get<ILogger>(coreModuleApi.symbols.logger);

  return (rpcUrl: string) => new EthAdapter(logger, rpcUrl);
};

export type TEthAdapterFactoryType = ReturnType<typeof ethAdapterFactory>;

export { ethAdapterFactory, EthAdapter };
