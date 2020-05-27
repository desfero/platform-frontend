import { AppError } from "classes/AppError";

class ApplicationStorageError extends AppError {
  constructor(message: string) {
    super(`ApplicationStorageError: ${message}`);
  }
}

export { ApplicationStorageError };
