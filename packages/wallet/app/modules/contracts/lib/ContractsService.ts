import {
  coreModuleApi,
  IContractsService,
  ILogger,
  IRateOracleAdapter,
  IERC20TokenAdapter,
  ILockedAccountAdapter,
  IICBMLockedAccountAdapter,
  TLibSymbolType,
} from "@neufund/shared-modules";
import { Signer, providers } from "ethers";
import { inject, injectable } from "inversify";
import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import { BigNumber } from "bignumber.js";

import { Universe } from "../../../lib/contracts/Universe";
import { UniverseFactory } from "../../../lib/contracts/UniverseFactory";
import * as knownInterfaces from "../../../lib/contracts/knownInterfaces.json";
import { walletEthModuleApi } from "../../eth/module";
import { RateOracleAdapterFactory } from "./RateOracleAdapter";
import { privateSymbols } from "./symbols";
import * as knownInterfaces from "../../../lib/contracts/knownInterfaces.json";
import { ERC20TokenAdapterFactory } from "./ERC20TokenAdapter";
import { LockedAccountAdapterFactory } from "./LockedAccountAdapter";
import { ICBMLockedAccountAdapterFactory } from "./ICBMLockedAccountAdapter";

/**
 * Initiates neufund smart contracts instances
 */
@injectable()
export class ContractsService implements IContractsService {
  private readonly logger: ILogger;
  private readonly universeContractAddress: TLibSymbolType<
    typeof privateSymbols.universeContractAddress
  >;
  private readonly ethManager: TLibSymbolType<typeof walletEthModuleApi.symbols.ethManager>;

  public neumark!: IERC20TokenAdapter;
  public euroToken!: IERC20TokenAdapter;
  public etherToken!: IERC20TokenAdapter;
  public euroLock!: ILockedAccountAdapter;
  public etherLock!: ILockedAccountAdapter;
  public icbmEuroLock!: IICBMLockedAccountAdapter;
  public icbmEtherLock!: IICBMLockedAccountAdapter;

  public rateOracle!: IRateOracleAdapter;

  public universe!: Universe;
  public balanceOf: (address: EthereumAddressWithChecksum) => Promise<BigNumber>;

  constructor(
    @inject(coreModuleApi.symbols.logger) logger: ILogger,
    @inject(privateSymbols.universeContractAddress)
    universeContractAddress: TLibSymbolType<typeof privateSymbols.universeContractAddress>,
    @inject(walletEthModuleApi.symbols.ethManager)
    ethManager: TLibSymbolType<typeof walletEthModuleApi.symbols.ethManager>,
  ) {
    this.logger = logger;
    this.ethManager = ethManager;
    this.universeContractAddress = universeContractAddress;

    // TODO: move to new eth module
    this.balanceOf = async (address: EthereumAddressWithChecksum) => {
      const balance = await this.ethManager.getBalance(address as any);
      return new BigNumber(balance.toString());
    };
  }

  public async init(): Promise<void> {
    this.logger.info("Initializing contracts...");

    const provider = await this.ethManager.getInternalProvider();

    this.universe = create(UniverseFactory, this.universeContractAddress, provider);

    const [
      neumarkAddress,
      euroTokenAddress,
      etherTokenAddress,
      euroLockAddress,
      etherLockAddress,
      icbmEuroLockAddress,
      icbmEtherLockAddress,
      tokenExchangeRateOracleAddress,
    ] = await this.universe.getManySingletons([
      // tokens
      knownInterfaces.neumark,
      knownInterfaces.euroToken,
      knownInterfaces.etherToken,
      knownInterfaces.euroLock,
      knownInterfaces.etherLock,
      knownInterfaces.icbmEuroLock,
      knownInterfaces.icbmEtherLock,
      knownInterfaces.tokenExchangeRateOracle,
    ]);

    [
      this.neumark,
      this.euroToken,
      this.etherToken,
      this.euroLock,
      this.etherLock,
      this.icbmEuroLock,
      this.icbmEtherLock,
      this.rateOracle,
    ] = await Promise.all([
      create(ERC20TokenAdapterFactory, neumarkAddress, provider),
      create(ERC20TokenAdapterFactory, euroTokenAddress, provider),
      create(ERC20TokenAdapterFactory, etherTokenAddress, provider),
      create(LockedAccountAdapterFactory, euroLockAddress, provider),
      create(LockedAccountAdapterFactory, etherLockAddress, provider),
      create(ICBMLockedAccountAdapterFactory, icbmEuroLockAddress, provider),
      create(ICBMLockedAccountAdapterFactory, icbmEtherLockAddress, provider),
      create(RateOracleAdapterFactory, tokenExchangeRateOracleAddress, provider),
    ]);

    this.logger.info("Initializing contracts via UNIVERSE is DONE.");
  }
}

/**
 * Creates contract wrapper.
 */
function create<T>(
  Factory: ITypechainContractFactory<T>,
  address: string,
  signerOrProvider: Signer | providers.Provider,
): T {
  return Factory.connect(address, signerOrProvider);
}

interface ITypechainContractFactory<T> {
  connect(address: string, signerOrProvider: Signer | providers.Provider): T;
}
