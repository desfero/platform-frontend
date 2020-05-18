import { EthereumAddressWithChecksum, EthereumName } from "@neufund/shared-utils";
import { utils } from "ethers";

export enum EBlockTag {
  PENDING = "pending",
  LATEST = "latest",
}

export type TTransactionRequestRequired = {
  to: EthereumAddressWithChecksum | EthereumName;
  // TODO: hide under `EthManager` so there is not need to pass it from saga
  gasLimit: string;
  // TODO: hide under `EthManager` so there is not need to pass it from saga
  gasPrice: string;
  data?: string;
  value?: string;
};

export type TUnsignedTransaction = {
  to: EthereumAddressWithChecksum;
  nonce: number;
  gasLimit: string;
  gasPrice: string;
  data?: string;
  value?: string;
  chainId: number;
};

export interface ITransactionResponse extends utils.Transaction {
  blockNumber?: number;
  blockHash?: string;
  timestamp?: number;
  confirmations: number;
  from: string;
  raw?: string;
}

export enum EWalletType {
  HD_WALLET = "HD_WALLET",
  PRIVATE_KEY_WALLET = "PRIVATE_KEY_WALLET",
}

/**
 * A reduced version of Eth wallet metadata to have only what we need to show on UI during
 */
export type TWalletUIMetadata = {
  /**
   * `name` represent a user defined custom wallet name (now only stores fixture name)
   */
  name: string | undefined;
  address: EthereumAddressWithChecksum;
};
