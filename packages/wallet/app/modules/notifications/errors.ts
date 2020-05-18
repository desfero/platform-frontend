import { AppError } from "../../classes/AppError";

class NotificationsModuleError extends AppError {
  constructor(message: string) {
    super(`NotificationsModuleError: ${message}`);
  }
}

export { NotificationsModuleError };
