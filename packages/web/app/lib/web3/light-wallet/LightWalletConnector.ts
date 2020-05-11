import { ILogger } from "@neufund/shared-modules";
import { toEthereumAddress } from "@neufund/shared-utils";
import { addHexPrefix } from "ethereumjs-util";
import { inject, injectable } from "inversify";
import * as Web3 from "web3";
// tslint:disable-next-line
import * as Web3ProviderEngine from "web3-provider-engine";
// tslint:disable-next-line
import * as HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
// tslint:disable-next-line
import * as RpcSubprovider from "web3-provider-engine/subproviders/rpc";

import { symbols } from "../../../di/symbols";
import { EWalletType } from "../../../modules/web3/types";
import { makeEthereumAddressChecksummed } from "../../../modules/web3/utils";
import { STIPEND_ELIGIBLE_WALLETS } from "../constants";
import { IPersonalWallet } from "../PersonalWeb3";
import { IEthereumNetworkConfig } from "../types";
import { Web3Adapter } from "../Web3Adapter";
import {
  IVault,
  LightError,
  LightUnknownError,
  LightWallet,
  NativeSignTransactionUserError,
} from "./LightWallet";

@injectable()
export class LightWalletConnector {
  private web3Adapter?: Web3Adapter;
  public constructor(
    @inject(symbols.ethereumNetworkConfig)
    public readonly web3Config: IEthereumNetworkConfig,
    @inject(symbols.logger)
    public readonly logger: ILogger,
  ) {}
  public passwordProvider(): any {
    return "";
  }
  public connect = async (
    lightWalletVault: IVault,
    email: string,
    password?: string,
  ): Promise<IPersonalWallet> => {
    try {
      this.web3Adapter = new Web3Adapter(await this.setWeb3Provider(lightWalletVault));
      const ethereumAddress = makeEthereumAddressChecksummed(
        toEthereumAddress(addHexPrefix(lightWalletVault.walletInstance.addresses[0])),
      );

      return new LightWallet(this.web3Adapter, ethereumAddress, lightWalletVault, email, password);
    } catch (e) {
      if (e instanceof LightError) {
        throw e;
      } else {
        throw new LightUnknownError();
      }
    }
  };
  private setWeb3Provider = async (lightWalletVault: IVault): Promise<any> => {
    let engine: any;
    lightWalletVault.walletInstance.passwordProvider = (callback: any) =>
      callback(null, this.passwordProvider());
    try {
      // hooked-wallet-subprovider required methods were manually implemented
      const web3Provider = new HookedWalletSubprovider({
        signMessage: () => {
          // Native signTransaction Shouldn't be used
          throw new NativeSignTransactionUserError();
        },
        signPersonalMessage: () => {
          throw new NativeSignTransactionUserError();
        },
        signTypedMessage: () => {
          throw new NativeSignTransactionUserError();
        },
        signTransaction: () => {
          throw new NativeSignTransactionUserError();
        },
        getAccounts: (cb: any) => {
          const data = lightWalletVault.walletInstance.getAddresses.bind(
            lightWalletVault.walletInstance,
          )();
          cb(undefined, data);
        },
        approveTransaction: () => {
          return;
        },
      });
      engine = new Web3ProviderEngine();
      engine.addProvider(web3Provider);
      engine.addProvider(
        new RpcSubprovider({
          rpcUrl: STIPEND_ELIGIBLE_WALLETS.includes(EWalletType.LIGHT)
            ? this.web3Config.backendRpcUrl
            : this.web3Config.rpcUrl,
        }),
      );
      engine.start();
      // stop immediately to not poll for new block which does not have any use
      // todo: implement null block provider and pass it in opts.blockTracker
      engine.stop();
      return new Web3(engine);
    } catch (e) {
      if (engine) {
        engine.stop();
      }
      throw e;
    }
  };
}
