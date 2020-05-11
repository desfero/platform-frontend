import Eth from "@ledgerhq/hw-app-eth";
import { EthereumNetworkId } from "@neufund/shared-utils";
import { inject, injectable } from "inversify";
import * as Web3 from "web3";

import { symbols } from "../../../di/symbols";
import { EWalletType } from "../../../modules/web3/types";
import { STIPEND_ELIGIBLE_WALLETS } from "../constants";
import { IEthereumNetworkConfig } from "../types";
import { Web3Adapter } from "../Web3Adapter";
import { LedgerError, LedgerNotAvailableError, LedgerUnknownError } from "./errors";
import {
  connectToLedger,
  createWeb3WithLedgerProvider,
  obtainPathComponentsFromDerivationPath,
  testConnection,
} from "./ledgerUtils";
import { LedgerWallet } from "./LedgerWallet";
import { IDerivationPathToAddress, ILedgerCustomProvider } from "./types";

@injectable()
export class LedgerWalletConnector {
  private web3?: Web3;
  private ledgerInstance?: ILedgerCustomProvider;
  private getTransport?: () => any;

  public constructor(
    @inject(symbols.ethereumNetworkConfig) public readonly web3Config: IEthereumNetworkConfig,
  ) {}

  public connect = async (): Promise<void> => {
    try {
      this.getTransport = await connectToLedger();
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new LedgerNotAvailableError();
      }
    } catch (e) {
      if (e instanceof LedgerError) {
        throw e;
      } else {
        throw new LedgerUnknownError();
      }
    }
  };

  public finishConnecting = async (
    derivationPath: string,
    networkId: EthereumNetworkId,
  ): Promise<LedgerWallet> => {
    if (!this.getTransport) throw new LedgerNotAvailableError();

    let providerEngine: any;
    try {
      const { ledgerWeb3, ledgerInstance } = await createWeb3WithLedgerProvider(
        networkId,
        STIPEND_ELIGIBLE_WALLETS.includes(EWalletType.LEDGER)
          ? this.web3Config.backendRpcUrl
          : this.web3Config.rpcUrl,
        this.getTransport,
        derivationPath,
      );
      providerEngine = ledgerWeb3.currentProvider;

      this.web3 = ledgerWeb3;
      this.ledgerInstance = ledgerInstance;

      const web3Adapter = new Web3Adapter(this.web3);
      const address = await web3Adapter.getAccountAddressWithChecksum();

      return new LedgerWallet(web3Adapter, address, this.ledgerInstance, derivationPath);
    } catch (e) {
      // we need to explicitly stop Web3 Provider engine
      if (providerEngine) {
        providerEngine.stop();
      }
      throw e;
    }
  };

  public getMultipleAccountsFromHdPath = async (
    derivationPaths: string,
    indexOffset: number = 1,
    accountsNo: number = 0,
  ): Promise<IDerivationPathToAddress> => {
    if (!this.getTransport) throw new LedgerNotAvailableError();

    const Transport = await this.getTransport();
    try {
      const pathComponents = obtainPathComponentsFromDerivationPath(derivationPaths);

      const chainCode = false; // Include the chain code
      const ethInstance = new Eth(Transport);

      const addresses: IDerivationPathToAddress = {};
      for (let i = indexOffset; i < indexOffset + accountsNo; i += 1) {
        const path = pathComponents.basePath + (pathComponents.index + i).toString();
        const address = await ethInstance.getAddress(path, false, chainCode);
        addresses[path] = address.address;
      }
      return addresses;
    } finally {
      await Transport.close();
    }
  };

  public getMultipleAccounts = async (
    derivationPaths: string[],
  ): Promise<IDerivationPathToAddress> => {
    const accounts = await Promise.all(
      derivationPaths.map(path => this.getMultipleAccountsFromHdPath(path, 0, 1)),
    );

    // reduce to single object
    return Object.assign({}, ...accounts);
  };

  public getMultipleAccountsFromDerivationPrefix = async (
    derivationPathPrefix: string,
    page: number,
    addressesPerPage: number,
  ): Promise<IDerivationPathToAddress> =>
    this.getMultipleAccountsFromHdPath(
      derivationPathPrefix,
      page * addressesPerPage,
      addressesPerPage,
    );

  public testConnection = async (): Promise<boolean> => {
    if (!this.getTransport) throw new LedgerNotAvailableError();

    return testConnection(this.getTransport);
  };
}
