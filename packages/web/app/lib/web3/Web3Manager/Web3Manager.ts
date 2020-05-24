import { ESignerType, IEthManager, ILogger } from "@neufund/shared-modules";
import {
  EthereumAddress,
  EthereumAddressWithChecksum,
  EthereumNetworkId,
} from "@neufund/shared-utils";
import { BigNumber } from "bignumber.js";
import PollingBlockTracker from "eth-block-tracker";
import { EventEmitter } from "events";
import { decorate, inject, injectable } from "inversify";
import * as Web3 from "web3";

import { symbols } from "../../../di/symbols";
import { calculateGasLimitWithOverhead, encodeTransaction } from "../../../modules/tx/utils";
import { IPersonalWallet } from "../PersonalWeb3";
import { IEthereumNetworkConfig, ITxData, ITxMetadata } from "../types";
import { Web3Adapter } from "../Web3Adapter";
import { Web3FactoryType } from "../Web3Batch/Web3Batch";

export const DEFAULT_UPPER_GAS_LIMIT = 2000000;
export const DEFAULT_LOWER_GAS_LIMIT = 21000;
export class WalletNotConnectedError extends Error {
  constructor() {
    super("Wallet not connected");
  }
}
export class SignerError extends Error {}
export class SignerRejectConfirmationError extends SignerError {}
export class SignerTimeoutError extends SignerError {}
export class SignerUnknownError extends SignerError {}

export enum EWeb3ManagerEvents {
  NEW_PERSONAL_WALLET_PLUGGED = "web3_manager_new_personal_wallet_plugged",
  PERSONAL_WALLET_UNPLUGGED = "web3_manager_personal_wallet_unplugged",
  NEW_BLOCK_ARRIVED = "newBlockArrived",
  ETH_BLOCK_TRACKER_ERROR = "ethBlockTrackerError",
}

try {
  // this throws if applied multiple times, which happens in tests
  // that is why the try block is necessary
  decorate(injectable(), EventEmitter);
  // this decorate is necessary for injectable class inheritance
} catch {}

// singleton holding all web3 instances
@injectable()
export class Web3Manager extends EventEmitter implements IEthManager {
  public personalWallet?: IPersonalWallet;
  public networkId!: EthereumNetworkId;
  public blockTracker!: PollingBlockTracker;
  protected internalWeb3Adapter!: Web3Adapter;
  protected internalTxWeb3Adapter!: Web3Adapter;

  constructor(
    @inject(symbols.ethereumNetworkConfig)
    public readonly ethereumNetworkConfig: IEthereumNetworkConfig,
    @inject(symbols.logger) public readonly logger: ILogger,
    @inject(symbols.web3Factory) private web3Factory: Web3FactoryType,
  ) {
    super();
  }

  public async initialize(): Promise<void> {
    const web3 = this.web3Factory(
      new Web3.providers.HttpProvider(this.ethereumNetworkConfig.rpcUrl),
    );

    //used for some transaction types that are executed on a special proxied node, e.g. gasless transactions
    const txWeb3 = this.web3Factory(
      new Web3.providers.HttpProvider(this.ethereumNetworkConfig.backendRpcUrl),
    );

    this.internalTxWeb3Adapter = new Web3Adapter(txWeb3);
    this.internalWeb3Adapter = new Web3Adapter(web3);

    this.networkId = await this.internalWeb3Adapter.getNetworkId();

    this.blockTracker = new PollingBlockTracker({
      provider: this.internalWeb3Adapter.web3.currentProvider,
      setSkipCacheFlag: false,
    });
    this.blockTracker.on("latest", blockNumber => {
      this.emit(EWeb3ManagerEvents.NEW_BLOCK_ARRIVED, {
        blockNumber,
      });
    });
    this.blockTracker.on("error", error => {
      this.emit(EWeb3ManagerEvents.ETH_BLOCK_TRACKER_ERROR, {
        error,
      });
    });
  }

  public async plugPersonalWallet(personalWallet: IPersonalWallet): Promise<void> {
    this.personalWallet = personalWallet;

    this.emit(EWeb3ManagerEvents.NEW_PERSONAL_WALLET_PLUGGED, {
      isUnlocked: this.personalWallet.isUnlocked(),
      metaData: this.personalWallet.getMetadata(),
    });
  }

  /**
   * This method exposes the whole web3 object
   * IN ALMOST ALL CASES YOU DON'T NEED A FULL WEB3 OBJECT
   * USE AT YOUR OWEN RISK
   */

  public getFullWeb3Object(): Web3 {
    return this.internalWeb3Adapter.web3;
  }

  public async unplugPersonalWallet(): Promise<void> {
    if (this.personalWallet) {
      this.emit(EWeb3ManagerEvents.PERSONAL_WALLET_UNPLUGGED, {
        metaData: this.personalWallet.getMetadata(),
      });

      await this.personalWallet.unplug();
      this.personalWallet = undefined;
    } else {
      throw new WalletNotConnectedError();
    }
  }

  async hasPluggedWallet(): Promise<boolean> {
    return !!this.personalWallet;
  }

  async getWalletSignerType(): Promise<ESignerType> {
    if (this.personalWallet) {
      return this.personalWallet.getSignerType();
    } else {
      throw new WalletNotConnectedError();
    }
  }

  async getWalletAddress(): Promise<EthereumAddressWithChecksum> {
    if (this.personalWallet) {
      return this.personalWallet.ethereumAddress;
    } else {
      throw new WalletNotConnectedError();
    }
  }

  public async signMessage(message: string): Promise<string> {
    return this.sign(message);
  }

  public async sign(message: string): Promise<string> {
    if (this.personalWallet) {
      return this.personalWallet.signMessage(message);
    } else {
      throw new WalletNotConnectedError();
    }
  }

  public async getTransactionCount(address: EthereumAddress): Promise<number> {
    return this.internalWeb3Adapter.getTransactionCount(address);
  }

  public async sendTransaction(tx: ITxData, metadata: ITxMetadata): Promise<string> {
    if (this.personalWallet) {
      return this.personalWallet.sendTransaction(tx, metadata);
    } else {
      throw new WalletNotConnectedError();
    }
  }

  public async getTransactionByHash(txHash: string): Promise<Web3.Transaction> {
    return this.internalTxWeb3Adapter.getTransactionByHash(txHash); //wc internalWeb3Adapter
  }

  public async getTransactionReceipt(txHash: string): Promise<Web3.TransactionReceipt | null> {
    return this.internalTxWeb3Adapter.getTransactionReceipt(txHash); ////wc internalWeb3Adapter
  }

  public async getBlockNumber(): Promise<number> {
    return this.internalWeb3Adapter.getBlockNumber();
  }

  public async getBalance(userAddress: EthereumAddress): Promise<BigNumber> {
    return this.internalWeb3Adapter.getBalance(userAddress);
  }

  public async isSmartContract(address: EthereumAddress): Promise<boolean> {
    return this.internalWeb3Adapter.isSmartContract(address);
  }

  public async estimateGas(txData: Partial<Web3.TxData>): Promise<number> {
    const encodedTxData = encodeTransaction(txData);
    return this.internalWeb3Adapter.estimateGas(encodedTxData);
  }

  public async estimateGasWithOverhead(txData: Partial<Web3.TxData>): Promise<string> {
    const gas = await this.estimateGas(txData);
    // There is Smart Contract Attack Vector that extreme high gas amounts
    if (gas < DEFAULT_LOWER_GAS_LIMIT || gas > DEFAULT_UPPER_GAS_LIMIT) {
      this.logger.error(
        new Error(
          `Transaction with very hight/low gas limit VALUE: "${gas.toString()} TX DATA: ${JSON.stringify(
            txData,
          )}`,
        ),
      );
      // No need for overhead in this case
      return DEFAULT_UPPER_GAS_LIMIT.toString();
    }
    // If gas is 21000 it means its a regular transaction
    return gas === DEFAULT_LOWER_GAS_LIMIT
      ? gas.toString()
      : calculateGasLimitWithOverhead(gas.toString());
  }
}
