import { ESignerType, EWalletSubType, EWalletType } from "@neufund/shared-modules";
import {
  EthereumAddressWithChecksum,
  EthereumNetworkId,
  toEthereumAddress,
} from "@neufund/shared-utils";
import * as hex2ascii from "hex2ascii";

import { ITxData, ITxMetadata } from "../../../lib/web3/types";
import { EWalletSubType, EWalletType, IBrowserWalletMetadata } from "../../../modules/web3/types";
import { IPersonalWallet } from "../PersonalWeb3";
import { Web3Adapter } from "../Web3Adapter";
import { SignerRejectConfirmationError } from "../Web3Manager/Web3Manager";
import { parseBrowserWalletError } from "./BrowserWalletConnector";

export class BrowserWalletError extends Error {}
export class BrowserWalletMissingError extends BrowserWalletError {}
export class BrowserWalletMismatchedNetworkError extends BrowserWalletError {
  constructor(
    public readonly desiredNetworkId: EthereumNetworkId,
    public readonly actualNetworkId: EthereumNetworkId,
  ) {
    super("MismatchedNetworkError");
  }
}
export class BrowserWalletLockedError extends BrowserWalletError {}
export class BrowserWalletAccountApprovalRejectedError extends BrowserWalletError {}
export class BrowserWalletAccountApprovalPendingError extends BrowserWalletError {}
export class BrowserWalletConfirmationRejectedError extends BrowserWalletError {}
export class BrowserWalletUnknownError extends BrowserWalletError {}

export class BrowserWallet implements IPersonalWallet {
  public readonly walletType = EWalletType.BROWSER;

  constructor(
    public readonly web3Adapter: Web3Adapter,
    public readonly walletSubType: EWalletSubType,
    public readonly ethereumAddress: EthereumAddressWithChecksum,
  ) {}

  public getSignerType = (): ESignerType => {
    switch (this.walletSubType) {
      case EWalletSubType.METAMASK:
        return ESignerType.ETH_SIGN_TYPED_DATA;
      case EWalletSubType.GNOSIS:
        return ESignerType.ETH_SIGN_GNOSIS_SAFE;
      default:
        return ESignerType.ETH_SIGN;
    }
  };

  public testConnection = async (networkId: string): Promise<boolean> => {
    const currentNetworkId = await this.web3Adapter.getNetworkId();
    if (currentNetworkId !== networkId) {
      return false;
    }

    return !!(await this.web3Adapter.getAccountAddress());
  };

  public signMessage = async (data: string): Promise<string> => {
    try {
      // 'truffle-private-key` provider uses an old version of `web3-provider-engine`
      // WalletSubprovider that requires address to be lower cased manually
      // see: https://github.com/MetaMask/web3-provider-engine/issues/294
      const address =
        process.env.NF_CYPRESS_RUN === "1"
          ? toEthereumAddress(this.ethereumAddress.toLowerCase())
          : this.ethereumAddress;

      if (this.walletSubType === EWalletSubType.METAMASK) {
        const typedDataDecoded = JSON.parse(hex2ascii(data));
        // We can await as signTypedData function already awaits inside for result of RPC call.
        return await this.web3Adapter.signTypedData(address, typedDataDecoded);
      } else if (this.walletSubType === EWalletSubType.GNOSIS) {
        const typedDataDecoded = hex2ascii(data);
        return await this.web3Adapter.signTypedDataV3(address, typedDataDecoded);
      } else {
        return await this.web3Adapter.ethSign(address, "0x" + data);
      }
    } catch (e) {
      const error = parseBrowserWalletError(e);
      if (error instanceof BrowserWalletConfirmationRejectedError) {
        throw new SignerRejectConfirmationError();
      } else {
        throw error;
      }
    }
  };

  public sendTransaction = async (txData: ITxData, _: ITxMetadata): Promise<string> => {
    try {
      return await this.web3Adapter.sendTransaction(txData);
    } catch (e) {
      const error = parseBrowserWalletError(e);
      if (error instanceof BrowserWalletConfirmationRejectedError) {
        throw new SignerRejectConfirmationError();
      } else {
        throw error;
      }
    }
  };

  public getMetadata = (): IBrowserWalletMetadata => ({
    address: this.ethereumAddress,
    walletType: EWalletType.BROWSER,
    walletSubType: this.walletSubType,
    salt: undefined,
    email: undefined,
  });

  public isUnlocked = (): boolean => true;

  public unplug = () => Promise.resolve();

  // browser wallet is by default unlocked
  public unlock = (_: string) => Promise.reject();
}
