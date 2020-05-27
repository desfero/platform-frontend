import { AppError } from "classes/AppError";

class WalletConnectModuleError extends AppError {
  constructor(message: string) {
    super(`WalletConnectModuleError: ${message}`);
  }
}

export { WalletConnectModuleError };
