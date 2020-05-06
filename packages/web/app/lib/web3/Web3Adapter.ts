import {
  EthereumAddress,
  EthereumAddressWithChecksum,
  EthereumNetworkId,
  promisify,
} from "@neufund/shared-utils";
import { BigNumber } from "bignumber.js";
import * as Web3 from "web3";

import { makeEthereumAddressChecksummed } from "../../modules/web3/utils";

class Web3Error extends Error {}
export class NeuWeb3Error extends Error {}
export class UserHasNoFundsError extends NeuWeb3Error {}

export class NotEnoughEtherForGasError extends Web3Error {}
export class RevertedTransactionError extends Web3Error {}
export class OutOfGasError extends Web3Error {}
export class NotEnoughFundsError extends Web3Error {}

export class EthNodeError extends Error {}
export class LowGasNodeError extends EthNodeError {}
export class LowNonceError extends EthNodeError {}
export class LongTransactionQueError extends EthNodeError {}
export class InvalidRlpDataError extends EthNodeError {}
export class InvalidChangeIdError extends EthNodeError {}
export class UnknownEthNodeError extends EthNodeError {}

/**
 * Layer on top of raw Web3js. Simplifies API for common operations. Adds promise support.
 * Note that some methods may be not supported correctly by exact implementation of your client
 */
export class Web3Adapter {
  constructor(public readonly web3: Web3) {}

  public getNetworkId = async (): Promise<EthereumNetworkId> =>
    promisify<EthereumNetworkId>(this.web3.version.getNetwork)();

  public async getBalance(address: string): Promise<BigNumber> {
    return promisify<BigNumber>(this.web3.eth.getBalance)(address);
  }

  public async estimateGas(txData: Partial<Web3.TxData>): Promise<number> {
    return promisify<number>(this.web3.eth.estimateGas)(txData);
  }

  public async getAccountAddress(): Promise<EthereumAddress> {
    const getAccounts = promisify<string[]>(this.web3.eth.getAccounts);
    const accounts = await getAccounts();
    return accounts[0] as EthereumAddress;
  }

  // returns mixed case checksummed ethereum address according to: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md
  public async getAccountAddressWithChecksum(): Promise<EthereumAddressWithChecksum> {
    const address = await this.getAccountAddress();
    return makeEthereumAddressChecksummed(address);
  }

  public async ethSign(
    address: EthereumAddress | EthereumAddressWithChecksum,
    data: string,
  ): Promise<string> {
    const sign = promisify<string>(this.web3.eth.sign);
    return sign(address, data);
  }

  public async signTypedData(
    address: EthereumAddress | EthereumAddressWithChecksum,
    data: ITypedDataToSign[],
  ): Promise<string> {
    const send = promisify<any>(
      this.web3.currentProvider.sendAsync.bind(this.web3.currentProvider),
    ); // web3 typings are not accurate here

    const resultData = await send({
      method: "eth_signTypedData",
      params: [data, address as string],
      from: address as string,
    });

    // as some web3 providers pass error as result, promisify may not throw
    if (resultData.error !== undefined) {
      throw resultData.error;
    }

    return resultData.result;
  }

  // Gnosis extension uses wallet_signTypedData to sign ERC712 typed data
  public async signTypedDataV3(
    address: EthereumAddress | EthereumAddressWithChecksum,
    data: string,
  ): Promise<string> {
    const send = promisify<any>(
      this.web3.currentProvider.sendAsync.bind(this.web3.currentProvider),
    ); // web3 typings are not accurate here

    const resultData = await send({
      method: "eth_signTypedData",
      params: [address as string, data],
      from: address as string,
    });

    // as some web3 providers pass error as result, promisify may not throw
    if (resultData.error !== undefined) {
      throw resultData.error;
    }

    return resultData.result;
  }

  public async getTransactionReceipt(txHash: string): Promise<Web3.TransactionReceipt | null> {
    const getTransactionReceipt = promisify<Web3.TransactionReceipt>(
      this.web3.eth.getTransactionReceipt.bind(this.web3.eth),
    );
    return await getTransactionReceipt(txHash);
  }

  public async getTransactionByHash(txHash: string): Promise<Web3.Transaction> {
    const getTransactionByHash = promisify<Web3.Transaction>(
      this.web3.eth.getTransaction.bind(this.web3.eth),
    );
    return await getTransactionByHash(txHash);
  }

  public async getTransactionCount(address: string): Promise<number> {
    const getTransactionCount = promisify<number>(
      this.web3.eth.getTransactionCount.bind(this.web3.eth),
    );
    return await getTransactionCount(address);
  }

  public async sendRawTransaction(txData: string): Promise<string> {
    const send = promisify<any>(this.web3.eth.sendRawTransaction.bind(this.web3.eth));
    return await send(txData);
  }

  /**
   * This will ensure that txData has nonce value.
   */
  public async sendTransaction(txData: Web3.TxData): Promise<string> {
    const send = promisify<any>(this.web3.eth.sendTransaction.bind(this.web3.eth));

    // we manually add nonce value if needed
    // later it's needed by backend
    if (txData.nonce === undefined) {
      const getTransactionCount = promisify<number>(
        this.web3.eth.getTransactionCount.bind(this.web3.eth),
      );

      txData.nonce = await getTransactionCount(txData.from);
    }

    return await send(txData);
  }

  public async getBlockNumber(): Promise<number> {
    const getBlockNumber = promisify<number>(this.web3.eth.getBlockNumber);

    return getBlockNumber();
  }

  public isSmartContract(address: EthereumAddress): Promise<boolean> {
    // in case of missing smartcontract, code can be equal to "0x0" or "0x" depending on exact web3 implementation
    // to cover all these cases we just check against the source code length — there won't be any meaningful EVM program in less then 3 chars
    return promisify<string>(this.web3.eth.getCode)(address).then(v => v.length >= 4);
  }
}

interface ITypedDataToSign {
  type: string; // todo: here we could use more specific type. Something like "string" | "uint32" etc.
  name: string;
  value: string;
}
