import { ESignerType, EWalletSubType, EWalletType } from "@neufund/shared-modules";
import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import { addHexPrefix, toBuffer } from "ethereumjs-util";
import * as Web3 from "web3";

import { ILedgerWalletMetadata } from "../../../modules/web3/types";
import { IPersonalWallet } from "../PersonalWeb3";
import { Web3Adapter } from "../Web3Adapter";
import { SignerRejectConfirmationError, SignerTimeoutError } from "../Web3Manager/Web3Manager";
import {
  LedgerConfirmationRejectedError,
  LedgerNotAvailableError,
  LedgerTimeoutError,
  parseLedgerError,
} from "./errors";
import { testConnection } from "./ledgerUtils";
import { ILedgerCustomProvider } from "./types";

export class LedgerWallet implements IPersonalWallet {
  public readonly walletType = EWalletType.LEDGER;
  public readonly walletSubType = EWalletSubType.UNKNOWN; // in future we may detect if it's pure ledger or Neukey
  waitingForCommand = false; // if ledger is waiting for user interaction it is blocked and you should not send any instructions to it.

  public constructor(
    public readonly web3Adapter: Web3Adapter,
    public readonly ethereumAddress: EthereumAddressWithChecksum,
    private readonly ledgerInstance: ILedgerCustomProvider | undefined,
    public readonly derivationPath: string,
  ) {}

  public getSignerType = (): ESignerType => ESignerType.ETH_SIGN;

  public testConnection = async (): Promise<boolean> => {
    if (!this.ledgerInstance) throw new LedgerNotAvailableError();

    if (this.waitingForCommand) {
      return true;
    }
    return testConnection(this.ledgerInstance.getTransport);
  };

  public signMessage = async (data: string): Promise<string> => {
    try {
      this.waitingForCommand = true;

      const signedMsg = await this.ledgerInstance!.signPersonalMessage({
        from: this.ethereumAddress,
        data: toBuffer(addHexPrefix(data)).toString("hex"),
      });

      //@see https://github.com/LedgerHQ/ledgerjs/blob/master/packages/web3-subprovider/src/index.js#L123
      // Backend expects V to have extra 27
      const encodedV = (parseInt(signedMsg.slice(-2), 10) + 27).toString(16);
      return signedMsg.slice(0, -2) + encodedV;
    } catch (e) {
      const ledgerError = parseLedgerError(e);
      if (ledgerError instanceof LedgerConfirmationRejectedError) {
        throw new SignerRejectConfirmationError();
      } else if (ledgerError instanceof LedgerTimeoutError) {
        throw new SignerTimeoutError();
      } else {
        throw ledgerError;
      }
    } finally {
      this.waitingForCommand = false;
    }
  };

  public getMetadata = (): ILedgerWalletMetadata => ({
    address: this.ethereumAddress,
    walletType: EWalletType.LEDGER,
    walletSubType: EWalletSubType.UNKNOWN,
    derivationPath: this.derivationPath,
    salt: undefined,
    email: undefined,
  });

  public sendTransaction = async (data: Web3.TxData): Promise<string> => {
    try {
      return await this.web3Adapter.sendTransaction(data);
    } catch (e) {
      const ledgerError = parseLedgerError(e);
      if (ledgerError instanceof LedgerConfirmationRejectedError) {
        throw new SignerRejectConfirmationError();
      } else if (ledgerError instanceof LedgerTimeoutError) {
        throw new SignerTimeoutError();
      } else {
        throw ledgerError;
      }
    } finally {
      this.waitingForCommand = false;
    }
  };

  public isUnlocked = (): boolean => true;

  public unplug = () => Promise.resolve();

  // ledger wallet is by default unlocked
  public unlock = (_: string) => Promise.reject();
}
