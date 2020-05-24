import { ESignerType, EWalletSubType, EWalletType } from "@neufund/shared-modules";
import { assertNever, EthereumAddressWithChecksum, safeSetTimeout } from "@neufund/shared-utils";
import { IClientMeta, IConnector } from "@walletconnect/types";
import { parseTransactionData } from "@walletconnect/utils";
import { addHexPrefix, hashPersonalMessage, toBuffer } from "ethereumjs-util";
import * as hex2ascii from "hex2ascii";

import { ESignTransactionMethod, ITxData, ITxMetadata } from "../../../lib/web3/types";
import { IWalletConnectMetadata } from "../../../modules/web3/types";
import { WalletError } from "../errors";
import { IPersonalWallet } from "../PersonalWeb3";
import { Web3Adapter } from "../Web3Adapter";
import { SignerTimeoutError } from "../Web3Manager/Web3Manager";
import { generateWalletMetaFormPeerMeta, TWcMeta } from "./utils";

export class WalletConnectGenericError extends WalletError {
  constructor(message: string) {
    super(`WalletConnect: ${message}`);
  }
}

export class WalletConnectSessionRejectedError extends WalletError {
  constructor(message: string) {
    super(`WalletConnect: sessionRequest rejected. ${message}`);
  }
}

export class WalletConnectChainIdError extends WalletError {
  constructor(chainId: number) {
    super(`WalletConnect: connected to invaliud chain id. ${chainId}`);
  }
}

export class WalletConnectWallet implements IPersonalWallet {
  constructor(
    public readonly web3Adapter: Web3Adapter,
    public readonly ethereumAddress: EthereumAddressWithChecksum,
    public readonly walletConnect: IConnector,
    public readonly peerMeta: IClientMeta | null,
  ) {
    this.walletMeta = generateWalletMetaFormPeerMeta(peerMeta);
    this.walletSubType = this.walletMeta.walletSubType;
  }

  public readonly walletType = EWalletType.WALLETCONNECT;
  public readonly walletSubType: EWalletSubType;
  private readonly walletMeta: TWcMeta;

  private signingTimeoutPromise = (signingTimeout: number): Promise<string> =>
    new Promise((_, reject) => {
      safeSetTimeout(() => {
        reject(new SignerTimeoutError());
      }, signingTimeout);
    });

  public getSignerType(): ESignerType {
    return this.walletMeta.signerType;
  }

  public async testConnection(networkId: string): Promise<boolean> {
    const currentNetworkId = await this.web3Adapter.getNetworkId();
    if (currentNetworkId !== networkId) {
      return false;
    }
    return !!(await this.web3Adapter.getAccountAddress());
  }

  public async signMessage(data: string): Promise<string> {
    let sign: Promise<string>;

    switch (this.walletMeta.signerType) {
      case ESignerType.ETH_SIGN_TYPED_DATA_V3:
      case ESignerType.ETH_SIGN_GNOSIS_SAFE:
        const typedDataDecoded = hex2ascii(data);
        sign = this.web3Adapter.signTypedDataV3(this.ethereumAddress, typedDataDecoded);
        break;
      case ESignerType.ETH_SIGN:
      case ESignerType.ETH_SIGN_ARGENT:
        let dataToSign = addHexPrefix(data);
        if (this.walletMeta.expectsEthSignDigest) {
          const msgHash = hashPersonalMessage(toBuffer(dataToSign));
          dataToSign = addHexPrefix(msgHash.toString("hex"));
        }
        sign = this.web3Adapter.ethSign(this.ethereumAddress, dataToSign);
        break;
      default:
        throw new WalletConnectGenericError(`Unknown signer type ${this.walletMeta.signerType}`);
    }

    return Promise.race([sign, this.signingTimeoutPromise(this.walletMeta.signingTimeout)]);
  }

  public async sendTransaction(txData: ITxData, metadata: ITxMetadata): Promise<string> {
    let send: Promise<string>;
    switch (this.walletMeta.sendTransactionMethod) {
      case ESignTransactionMethod.ETH_SEND_TRANSACTION:
        send = this.web3Adapter.sendTransaction(txData);
        break;
      case ESignTransactionMethod.ETH_SEND_TYPED_TRANSACTION:
        const parsedTx = parseTransactionData(txData);
        send = this.walletConnect.sendCustomRequest({
          method: "eth_sendTypedTransaction",
          params: [parsedTx, metadata],
        });
        break;
      default:
        assertNever(this.walletMeta.sendTransactionMethod);
    }

    return Promise.race([send, this.signingTimeoutPromise(this.walletMeta.signingTimeout)]);
  }

  public getMetadata(): IWalletConnectMetadata {
    return {
      address: this.ethereumAddress,
      walletType: EWalletType.WALLETCONNECT,
      walletSubType: this.walletSubType,
      salt: undefined,
      email: undefined,
    };
  }

  public isUnlocked(): boolean {
    return true;
  }

  public unlock = (_: string) => Promise.reject();

  public async unplug(): Promise<void> {
    if (this.walletConnect) {
      try {
        await this.walletConnect.killSession();
      } catch {
        // TODO: remove when we provide our own storage to wallet connect core
        (this.walletConnect as any)._removeStorageSession()();
      }
    }
  }
}
