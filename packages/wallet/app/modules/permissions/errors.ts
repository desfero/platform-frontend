import { AppError } from "classes/AppError";

class PermissionsModuleError extends AppError {
  constructor(message: string) {
    super(`PermissionsModuleError: ${message}`);
  }
}

export { PermissionsModuleError };
