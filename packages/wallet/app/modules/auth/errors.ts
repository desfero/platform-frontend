import { AppError } from "classes/AppError";

class AuthModuleError extends AppError {
  constructor(message: string) {
    super(`AuthModuleError: ${message}`);
  }
}

class InvalidImportPhraseError extends AuthModuleError {
  constructor() {
    super("InvalidImportPhraseError");
  }
}

export { AuthModuleError, InvalidImportPhraseError };
