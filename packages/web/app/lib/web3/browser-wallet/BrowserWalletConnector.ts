import { EWalletSubType } from "@neufund/shared-modules";
import { EthereumNetworkId, promisify } from "@neufund/shared-utils";
import { injectable } from "inversify";
import * as Web3 from "web3";

import { Web3Adapter } from "../Web3Adapter";
import {
  BrowserWallet,
  BrowserWalletAccountApprovalPendingError,
  BrowserWalletAccountApprovalRejectedError,
  BrowserWalletConfirmationRejectedError,
  BrowserWalletError,
  BrowserWalletLockedError,
  BrowserWalletMismatchedNetworkError,
  BrowserWalletMissingError,
  BrowserWalletUnknownError,
} from "./BrowserWallet";

type Web3Provider = Web3.Provider & {
  enable: () => Promise<void>;
};

type TWeb3Provider = {
  injectedWeb3Provider: Web3Provider | undefined;
  isLatestMetaMask: boolean;
};

@injectable()
export class BrowserWalletConnector {
  dataApprovalPending = false;

  public detectWeb3 = (): TWeb3Provider => {
    if (typeof (window as any).ethereum !== "undefined") {
      const injectedWeb3Provider = (window as any).ethereum;
      return { injectedWeb3Provider, isLatestMetaMask: true };
    } else if (typeof (window as any).web3 !== "undefined") {
      const injectedWeb3 = (window as any).web3;
      const injectedWeb3Provider = injectedWeb3.currentProvider;
      return { injectedWeb3Provider, isLatestMetaMask: false };
    } else {
      return { injectedWeb3Provider: undefined, isLatestMetaMask: false };
    }
  };

  public connect = async (networkId: EthereumNetworkId): Promise<BrowserWallet> => {
    const { isLatestMetaMask, injectedWeb3Provider } = this.detectWeb3();

    if (injectedWeb3Provider === undefined) {
      throw new BrowserWalletMissingError();
    }

    const newWeb3 = new Web3(injectedWeb3Provider);
    const web3Adapter = new Web3Adapter(newWeb3);
    // check for mismatched networkIds
    const personalWeb3NetworkId = await web3Adapter.getNetworkId();
    if (networkId !== personalWeb3NetworkId) {
      throw new BrowserWalletMismatchedNetworkError(networkId, personalWeb3NetworkId);
    }
    // TODO: this ugly code will be straighten when we drop suport for outdated Metamask versions - see github issue 1702
    if (!(await web3Adapter.getAccountAddress())) {
      if (isLatestMetaMask) {
        if (this.dataApprovalPending) {
          throw new BrowserWalletAccountApprovalPendingError();
        } else {
          try {
            this.dataApprovalPending = true;
            await injectedWeb3Provider.enable();
          } catch (e) {
            throw new BrowserWalletAccountApprovalRejectedError();
          } finally {
            this.dataApprovalPending = false;
          }
        }
        // Metamask ver that only partly implements EIP will resolve promise obtained from .enable() call but it still
        // can be in locked mode so no accounts will be returned. That's why we need second check.
        if (!(await web3Adapter.getAccountAddress())) {
          throw new BrowserWalletLockedError();
        }
        // For old Metamask versions is there are no accounts returned it means plugin is locked.
      } else {
        throw new BrowserWalletLockedError();
      }
    }
    const walletType = await this.getBrowserWalletType(web3Adapter.web3);
    const ethereumAddress = await web3Adapter.getAccountAddressWithChecksum();

    return new BrowserWallet(web3Adapter, walletType, ethereumAddress);
  };
  private getBrowserWalletType = async (web3: Web3): Promise<EWalletSubType> => {
    const nodeIdString = await promisify<string>(web3.version.getNode)();
    const matchNodeIdString = nodeIdString.toLowerCase();
    // safe will yield to metamask so order does not matter
    if ((web3.currentProvider as any).isSafe === true) {
      return EWalletSubType.GNOSIS;
    }
    if (matchNodeIdString.includes("metamask")) {
      return EWalletSubType.METAMASK;
    }
    if (matchNodeIdString.includes("parity")) {
      return EWalletSubType.PARITY;
    }
    return EWalletSubType.UNKNOWN;
  };
}

export const parseBrowserWalletError = (error: any): BrowserWalletError => {
  // detect Metamask rejection
  if (
    error.code !== undefined &&
    error.message !== undefined &&
    error.code === -32603 &&
    error.message.startsWith("Error: MetaMask Message Signature: User denied message signature.")
  ) {
    return new BrowserWalletConfirmationRejectedError();
  }
  // detect Parity rejection
  if (error.message !== undefined && error.message.startsWith("Request has been rejected.")) {
    return new BrowserWalletConfirmationRejectedError();
  }
  // detect Gnosis rejection
  if (
    error.message !== undefined &&
    (error.message.startsWith("Transaction rejected") ||
      error.message.startsWith("Signature rejected"))
  ) {
    return new BrowserWalletConfirmationRejectedError();
  }
  return new BrowserWalletUnknownError();
};
