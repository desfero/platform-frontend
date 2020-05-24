import { ESignerType, EWalletSubType, EWalletType } from "@neufund/shared-modules";
import { EthereumAddressWithChecksum, EthereumNetworkId } from "@neufund/shared-utils";

import { TWalletMetadata } from "../../modules/web3/types";
import { ITxData, ITxMetadata } from "./types";
import { Web3Adapter } from "./Web3Adapter";

export interface IPersonalWallet {
  readonly web3Adapter: Web3Adapter;
  readonly ethereumAddress: EthereumAddressWithChecksum;
  readonly walletType: EWalletType;
  readonly walletSubType: EWalletSubType;

  // returns type of a signer based on walletType and walletSubType
  getSignerType(): ESignerType;

  // this will be periodically ran by Web3Manager to ensure that wallet connection is still established
  testConnection(networkId: EthereumNetworkId): Promise<boolean>;

  // sign message with the best available method for a given wallet
  signMessage(data: string): Promise<string>;

  // sign and send transaction with optional metadata
  sendTransaction(txData: ITxData, metadata: ITxMetadata): Promise<string>;

  getMetadata(): TWalletMetadata;

  isUnlocked(): boolean;

  // unplugs wallet from provider ie. ending wallet connect session
  // called on user logout by web3 manager
  unplug(): Promise<void>;

  // unlocks wallet which gives access to private key
  unlock(passsword: string): Promise<void>;
}
