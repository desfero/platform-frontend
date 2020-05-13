import { IContractsService, ILogger } from "@neufund/shared-modules";
import { EthereumAddress, EthereumAddressWithChecksum } from "@neufund/shared-utils";
import { BigNumber } from "bignumber.js";
import { inject, injectable } from "inversify";
import * as Web3 from "web3";

import { IConfig } from "../../config/getConfig";
import { symbols } from "../../di/symbols";
import { EtherToken } from "../contracts/EtherToken";
import { ETOCommitment } from "../contracts/ETOCommitment";
import { ETOTerms } from "../contracts/ETOTerms";
import { EuroToken } from "../contracts/EuroToken";
import { EuroTokenController } from "../contracts/EuroTokenController";
import { FeeDisbursal } from "../contracts/FeeDisbursal";
import { ICBMLockedAccount } from "../contracts/ICBMLockedAccount";
import { IControllerGovernance } from "../contracts/IControllerGovernance";
import { IdentityRegistry } from "../contracts/IdentityRegistry";
import { IEquityToken } from "../contracts/IEquityToken";
import { IERC223Token } from "../contracts/IERC223Token";
import { ITokenController } from "../contracts/ITokenController";
import { ITokenExchangeRateOracle } from "../contracts/ITokenExchangeRateOracle";
import * as knownInterfaces from "../contracts/knownInterfaces.json";
import { LockedAccount } from "../contracts/LockedAccount";
import { Neumark } from "../contracts/Neumark";
import { PlatformTerms } from "../contracts/PlatformTerms";
import { Universe } from "../contracts/Universe";
import { Web3Manager } from "./Web3Manager/Web3Manager";

@injectable()
export class ContractsService implements IContractsService {
  private etoCommitmentCache: { [etoId: string]: ETOCommitment } = {};
  private equityTokensCache: { [equityTokenAddress: string]: IEquityToken } = {};
  private etoTermsCache: { [etoTermsId: string]: ETOTerms } = {};
  private controllerGovernanceCache: { [tokenController: string]: IControllerGovernance } = {};
  private tokenControllerCache: { [tokenController: string]: ITokenController } = {};
  private web3: Web3 | undefined;

  public universeContract!: Universe;
  public neumark!: Neumark;
  public euroToken!: EuroToken;
  public euroTokenController!: EuroTokenController;
  public etherToken!: EtherToken;

  public euroLock!: LockedAccount;
  public etherLock!: LockedAccount;
  public icbmEuroLock!: ICBMLockedAccount;
  public icbmEtherLock!: ICBMLockedAccount;
  public identityRegistry!: IdentityRegistry;
  public feeDisbursal!: FeeDisbursal;
  public platformTerms!: PlatformTerms;
  public rateOracle!: ITokenExchangeRateOracle;

  public balanceOf!: (address: EthereumAddressWithChecksum) => Promise<BigNumber>;

  constructor(
    @inject(symbols.config) private readonly config: IConfig,
    @inject(symbols.web3Manager) private readonly web3Manager: Web3Manager,
    @inject(symbols.logger) private readonly logger: ILogger,
  ) {}

  public async init(): Promise<void> {
    this.logger.info("Initializing contracts...");

    this.web3 = this.web3Manager.getFullWeb3Object();

    // TODO: move to new eth module
    this.balanceOf = (address: EthereumAddressWithChecksum) =>
      this.web3Manager.getBalance((address as unknown) as EthereumAddress);

    if (!this.web3) {
      throw new Error("Could not initialize web3");
    }

    this.universeContract = await create(
      Universe,
      this.web3,
      this.config.contractsAddresses.universeContractAddress,
    );

    const [
      neumarkAddress,
      euroLockAddress,
      etherLockAddress,
      icbmEuroLockAddress,
      icbmEtherLockAddress,
      euroTokenAddress,
      euroTokenControllerAddress,
      etherTokenAddress,
      tokenExchangeRateOracleAddress,
      identityRegistryAddress,
      platformTermsAddress,
      feeDisbursalAddress,
    ] = await this.universeContract.getManySingletons([
      knownInterfaces.neumark,
      knownInterfaces.euroLock,
      knownInterfaces.etherLock,
      knownInterfaces.icbmEuroLock,
      knownInterfaces.icbmEtherLock,
      knownInterfaces.euroToken,
      knownInterfaces.euroTokenController,
      knownInterfaces.etherToken,
      knownInterfaces.tokenExchangeRateOracle,
      knownInterfaces.identityRegistry,
      knownInterfaces.platformTerms,
      knownInterfaces.feeDisbursal,
    ]);

    [
      this.neumark,
      this.euroLock,
      this.etherLock,
      this.icbmEuroLock,
      this.icbmEtherLock,
      this.rateOracle,
      this.identityRegistry,
      this.platformTerms,
      this.euroToken,
      this.euroTokenController,
      this.etherToken,
      this.feeDisbursal,
    ] = await Promise.all<any>([
      create(Neumark, this.web3, neumarkAddress),
      create(LockedAccount, this.web3, euroLockAddress),
      create(LockedAccount, this.web3, etherLockAddress),
      create(ICBMLockedAccount, this.web3, icbmEuroLockAddress),
      create(ICBMLockedAccount, this.web3, icbmEtherLockAddress),
      create(ITokenExchangeRateOracle, this.web3, tokenExchangeRateOracleAddress),
      create(IdentityRegistry, this.web3, identityRegistryAddress),
      create(PlatformTerms, this.web3, platformTermsAddress),
      create(EuroToken, this.web3, euroTokenAddress),
      create(EuroTokenController, this.web3, euroTokenControllerAddress),
      create(EtherToken, this.web3, etherTokenAddress),
      create(FeeDisbursal, this.web3, feeDisbursalAddress),
    ]);

    this.logger.info("Initializing contracts via UNIVERSE is DONE.");
  }

  async getETOCommitmentContract(etoId: string): Promise<ETOCommitment> {
    if (this.etoCommitmentCache[etoId]) return this.etoCommitmentCache[etoId];

    const contract = await create(ETOCommitment, this.web3, etoId);
    this.etoCommitmentCache[etoId] = contract;
    return contract;
  }

  async getEquityToken(equityTokenAddress: string): Promise<IEquityToken> {
    if (this.equityTokensCache[equityTokenAddress]) {
      return this.equityTokensCache[equityTokenAddress];
    }

    const contract = await create(IEquityToken, this.web3, equityTokenAddress);
    this.equityTokensCache[equityTokenAddress] = contract;
    return contract;
  }

  async getERC223(equityTokenAddress: EthereumAddress): Promise<IERC223Token> {
    const contract = await this.getEquityToken(equityTokenAddress);
    return contract as IERC223Token;
  }

  async getEtoTerms(etoTermsAddress: string): Promise<ETOTerms> {
    if (this.etoTermsCache[etoTermsAddress]) return this.etoTermsCache[etoTermsAddress];

    const contract = await create(ETOTerms, this.web3, etoTermsAddress);
    this.etoTermsCache[etoTermsAddress] = contract;
    return contract;
  }

  async getControllerGovernance(controllerAddress: string): Promise<IControllerGovernance> {
    if (this.controllerGovernanceCache[controllerAddress]) {
      return this.controllerGovernanceCache[controllerAddress];
    }

    const contract = await create(IControllerGovernance, this.web3, controllerAddress);
    this.controllerGovernanceCache[controllerAddress] = contract;
    return contract;
  }

  async getTokenController(controllerAddress: EthereumAddress): Promise<ITokenController> {
    if (this.tokenControllerCache[controllerAddress]) {
      return this.tokenControllerCache[controllerAddress];
    }

    const contract = await create(ITokenController, this.web3, controllerAddress);
    this.tokenControllerCache[controllerAddress] = contract;
    return contract;
  }
}

/**
 * Creates contract wrapper.
 * In dev mode it will validate contract code to ease web3 development pains. In prod it will assume that address is correct, saving some network calls.
 */
async function create<T>(ContractCls: IContractCls<T>, web3: any, address: string): Promise<T> {
  if (process.env.NODE_ENV === "production") {
    return new ContractCls(web3, address);
  } else {
    return await ContractCls.createAndValidate(web3, address);
  }
}

// TODO: Move to TypeChain
interface IContractCls<T> {
  new (web3: any, address: string): T;
  createAndValidate(web3: any, address: string): Promise<T>;
}
