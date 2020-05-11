import { ESignerType } from "@neufund/shared-modules";
import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import { BigNumber } from "bignumber.js";
import * as LightWalletProvider from "eth-lightwallet";
import * as ethSig from "eth-sig-util";
import { addHexPrefix, hashPersonalMessage, toBuffer } from "ethereumjs-util";
import { TxData } from "web3";

import { EWalletSubType, EWalletType, ILightWalletMetadata } from "../../../modules/web3/types";
import { IPersonalWallet } from "../PersonalWeb3";
import { IRawTxData } from "../types";
import { Web3Adapter } from "../Web3Adapter";
import {
  getWalletKey,
  getWalletPrivKey,
  getWalletSeed,
  testWalletPassword,
} from "./LightWalletUtils";

export interface ICreateVault {
  password: string;
  hdPathString: string;
  recoverSeed?: string | undefined;
  customSalt?: string | undefined;
}

export interface IVault {
  walletInstance: any;
  salt: string;
}

export class LightError extends Error {}
export class LightWalletConnectorError extends LightError {}
export class LightWalletError extends LightError {}

export class LightSignMessageError extends LightWalletError {}
export class LightUnknownError extends LightError {}
export class LightWalletMissingPasswordError extends LightWalletError {}
export class LightWalletWrongPassword extends LightWalletError {}
export class LightWalletLocked extends LightWalletError {}

export class ProviderEngineError extends LightError {}
export class NativeSignTransactionUserError extends ProviderEngineError {}

export class LightWallet implements IPersonalWallet {
  constructor(
    public readonly web3Adapter: Web3Adapter,
    public readonly ethereumAddress: EthereumAddressWithChecksum,
    public readonly vault: IVault,
    public readonly email: string,
    public password?: string,
  ) {}

  public readonly walletType = EWalletType.LIGHT;
  public readonly walletSubType = EWalletSubType.UNKNOWN;

  public getSignerType(): ESignerType {
    return ESignerType.ETH_SIGN;
  }

  public testConnection = async (networkId: string): Promise<boolean> => {
    const currentNetworkId = await this.web3Adapter.getNetworkId();
    if (currentNetworkId !== networkId) {
      return false;
    }
    return !!(await this.web3Adapter.getAccountAddress());
  };

  public signMessage = async (data: string): Promise<string> => {
    if (!this.password) {
      throw new LightWalletMissingPasswordError();
    }
    try {
      const msgHash = hashPersonalMessage(toBuffer(addHexPrefix(data)));
      const rawSignedMsg = await LightWalletProvider.signing.signMsgHash(
        this.vault.walletInstance,
        await getWalletKey(this.vault.walletInstance, this.password),
        msgHash.toString("hex"),
        this.ethereumAddress,
      );
      // from signature parameters to eth_sign RPC
      // @see https://github.com/ethereumjs/ethereumjs-util/blob/master/docs/index.md#torpcsig
      return ethSig.concatSig(rawSignedMsg.v, rawSignedMsg.r, rawSignedMsg.s);
    } catch (e) {
      throw new LightSignMessageError();
    }
  };

  public sendTransaction = async (txData: TxData): Promise<string> => {
    if (!this.password) {
      throw new LightWalletMissingPasswordError();
    }
    const nonce = await this.web3Adapter.getTransactionCount(txData.from);

    const encodedTxData: IRawTxData = {
      from: txData.from,
      to: addHexPrefix(txData.to!),
      gas: addHexPrefix(new BigNumber((txData.gas && txData.gas.toString()) || "0").toString(16)),
      gasPrice: addHexPrefix(
        new BigNumber((txData.gasPrice && txData.gasPrice.toString()) || "0").toString(16),
      ),
      nonce: addHexPrefix(new BigNumber((nonce && nonce.toString()) || "0").toString(16)),
      value: addHexPrefix(
        new BigNumber((txData.value && txData.value.toString()) || "0").toString(16),
      ),
      data: addHexPrefix((txData.data && txData.data.toString()) || ""),
    };

    const rawData = LightWalletProvider.signing.signTx(
      this.vault.walletInstance,
      await getWalletKey(this.vault.walletInstance, this.password),
      encodedTxData,
      this.ethereumAddress,
    );
    return await this.web3Adapter.sendRawTransaction(addHexPrefix(rawData));
  };

  public getWalletPrivateData = async (): Promise<{
    seed: string;
    privateKey: string;
  }> => {
    if (!this.password) {
      throw new LightWalletMissingPasswordError();
    }
    const seed = await getWalletSeed(this.vault.walletInstance, this.password);
    const privateKey = await getWalletPrivKey(this.vault.walletInstance, this.password);
    return { seed, privateKey };
  };

  public async testPassword(newPassword: string): Promise<boolean> {
    return await testWalletPassword(this.vault.walletInstance, newPassword);
  }

  public getMetadata = (): ILightWalletMetadata => ({
    address: this.ethereumAddress,
    email: this.email,
    salt: this.vault.salt,
    walletType: this.walletType,
    walletSubType: this.walletSubType,
  });

  public isUnlocked = (): boolean => !!this.password;

  public unplug = () => Promise.resolve();
}
