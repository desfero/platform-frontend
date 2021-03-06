import { createActionFactory } from "@neufund/shared-utils";

export const actions = {
  unsubscribe: createActionFactory("MARKETING_EMAILS_UNSUBSCRIBE"),
  unsubscribeSuccess: createActionFactory("MARKETING_EMAILS_UNSUBSCRIBE_SUCCESS"),
  unsubscribeFailure: createActionFactory("MARKETING_EMAILS_UNSUBSCRIBE_FAILURE"),
};
