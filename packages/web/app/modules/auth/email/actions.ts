import { createActionFactory } from "@neufund/shared-utils";

export const emailActions = {
  verifyEmailLink: createActionFactory("AUTH_VERIFY_EMAIL_LINK"),
};
