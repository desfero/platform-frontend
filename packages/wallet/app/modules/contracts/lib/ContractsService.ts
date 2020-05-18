import {
  coreModuleApi,
  IContractsService,
  ILogger,
  IRateOracleAdapter,
  TLibSymbolType,
} from "@neufund/shared-modules";
import { Signer, providers } from "ethers";
import { inject, injectable } from "inversify";

import { EtherToken } from "../../../lib/contracts/EtherToken";
import { EtherTokenFactory } from "../../../lib/contracts/EtherTokenFactory";
import { EuroToken } from "../../../lib/contracts/EuroToken";
import { EuroTokenFactory } from "../../../lib/contracts/EuroTokenFactory";
import { Neumark } from "../../../lib/contracts/Neumark";
import { NeumarkFactory } from "../../../lib/contracts/NeumarkFactory";
import { Universe } from "../../../lib/contracts/Universe";
import { UniverseFactory } from "../../../lib/contracts/UniverseFactory";
import * as knownInterfaces from "../../../lib/contracts/knownInterfaces.json";
import { walletEthModuleApi } from "../../eth/module";
import { RateOracleAdapterFactory } from "./RateOracleAdapter";
import { privateSymbols } from "./symbols";

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

  public neumark!: Neumark;
  public euroToken!: EuroToken;
  public etherToken!: EtherToken;

  public rateOracle!: IRateOracleAdapter;

  public universe!: Universe;

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
  }

  public async init(): Promise<void> {
    this.logger.info("Initializing contracts...");

    const provider = await this.ethManager.getInternalProvider();

    this.universe = create(UniverseFactory, this.universeContractAddress, provider);

    const [
      neumarkAddress,
      euroTokenAddress,
      etherTokenAddress,
      tokenExchangeRateOracleAddress,
    ] = await this.universe.getManySingletons([
      knownInterfaces.neumark,
      knownInterfaces.euroToken,
      knownInterfaces.etherToken,
      knownInterfaces.tokenExchangeRateOracle,
    ]);

    [this.neumark, this.rateOracle, this.euroToken, this.etherToken] = await Promise.all([
      create(NeumarkFactory, neumarkAddress, provider),
      create(RateOracleAdapterFactory, tokenExchangeRateOracleAddress, provider),
      create(EuroTokenFactory, euroTokenAddress, provider),
      create(EtherTokenFactory, etherTokenAddress, provider),
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
