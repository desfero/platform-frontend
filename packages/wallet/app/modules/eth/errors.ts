import { AppError } from "classes/AppError";

class EthModuleError extends AppError {
  constructor(message: string) {
    super(`EthModuleError: ${message}`);
  }
}

export { EthModuleError };
