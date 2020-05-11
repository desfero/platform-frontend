declare module "web3-provider-engine" {
  import { Provider, JSONRPCRequestPayload, JSONRPCResponsePayload } from "web3";

  namespace Web3ProviderEngine {
    export interface ProviderOpts {
      static?: {
        eth_syncing?: boolean;
        web3_clientVersion?: string;
      };
      rpcUrl?: string;
      getAccounts?: (error: any, accounts?: Array<string>) => void;
      approveTransaction?: Function;
      signTransaction?: Function;
      signMessage?: Function;
      processTransaction?: Function;
      processMessage?: Function;
      processPersonalMessage?: Function;
    }
  }

  interface Web3ProviderEngineOptions {
    pollingInterval?: number;
    blockTracker?: any;
    blockTrackerProvider?: any;
  }

  class Web3ProviderEngine implements Provider {
    constructor(options?: Web3ProviderEngineOptions);

    on(event: string, handler: () => void): void;

    send(payload: JSONRPCRequestPayload): void;

    sendAsync(
      payload: JSONRPCRequestPayload,
      callback: (error: Error, response: JSONRPCResponsePayload) => void,
    ): void;

    addProvider(provider: any): void;

    // start block polling
    start(callback?: () => void): void;

    // stop block polling
    stop(): void;
  }

  export = Web3ProviderEngine;
}

declare module "web3-provider-engine/zero" {
  import * as Web3ProviderEngine from "web3-provider-engine";

  function ZeroClientProvider(opts: Web3ProviderEngine.ProviderOpts): Web3ProviderEngine;

  namespace ZeroClientProvider {}

  export = ZeroClientProvider;
}

declare module "web3-provider-engine/subproviders/filters" {
  class FiltersSubprovider {}

  namespace FiltersSubprovider {}

  export = FiltersSubprovider;
}

declare module "web3-provider-engine/subproviders/hooked-wallet" {
  import * as Web3 from "web3";

  class HookedWalletSubprovider {
    constructor(opts?: HookedWalletSubprovider.Options);
  }

  namespace HookedWalletSubprovider {
    type Address = string;
    type HexString = string;

    export type Callback<A> = (err: Error | null | undefined, result?: A) => void;
    export type Function1<A, B> = (a: A, callback: Callback<B>) => void;
    export type MsgParams = { from: Address; data: HexString };
    export type TypedMsgParams = { from: Address; data: object | HexString };
    export type RecoveryParams = { sig: HexString; data: HexString };

    export interface Options {
      getAccounts: (callback: Callback<Array<string>>) => void;

      signTransaction?: Function1<Web3.TxData, any>;
      signMessage?: Function1<MsgParams, HexString>;
      signPersonalMessage?: Function1<MsgParams, HexString>;
      signTypedMessage?: Function1<TypedMsgParams, HexString>;

      processTransaction?: Function1<Web3.TxData, HexString>;
      processSignTransaction?: Function1<Web3.TxData, HexString>;
      processMessage?: Function1<MsgParams, HexString>;
      processPersonalMessage?: Function1<MsgParams, HexString>;
      processTypedMessage?: Function1<TypedMsgParams, HexString>;
      approveTransaction?: Function1<Web3.TxData, boolean>;
      approveMessage?: Function1<MsgParams, boolean>;
      approvePersonalMessage?: Function1<MsgParams, boolean>;
      approveTypedMessage?: Function1<TypedMsgParams, boolean>;
      recoverPersonalSignature?: Function1<RecoveryParams, Address>;
      publishTransaction?: Function1<HexString, HexString>;
    }
  }

  export = HookedWalletSubprovider;
}

declare module "web3-provider-engine/subproviders/provider" {
  import * as Web3 from "web3";

  class ProviderSubprovider {
    constructor(provider: Web3.Provider);
  }

  namespace ProviderSubprovider {}

  export = ProviderSubprovider;
}
