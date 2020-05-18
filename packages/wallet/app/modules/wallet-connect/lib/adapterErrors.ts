import { WalletConnectModuleError } from "../errors";

class WalletConnectAdapterError extends WalletConnectModuleError {
  constructor(message: string) {
    super(`WalletConnectAdapter: ${message}`);
  }
}

class InvalidRPCMethodError extends WalletConnectAdapterError {
  constructor(method: string) {
    super(`Invalid RPC method received (${method})`);
  }
}

class NoPeerMetaError extends WalletConnectAdapterError {
  constructor() {
    super("No peer meta provided");
  }
}

class InvalidJSONRPCPayloadError extends WalletConnectAdapterError {
  constructor(method: string) {
    super(`Invalid json rpc payload received for ${method}`);
  }
}

export {
  InvalidJSONRPCPayloadError,
  InvalidRPCMethodError,
  NoPeerMetaError,
  WalletConnectAdapterError,
};
