import { createActionFactory } from "@neufund/shared-utils";

export const initActions = {
  start: createActionFactory("INIT_START"),
  done: createActionFactory("INIT_DONE"),
  error: createActionFactory("INIT_ERROR", (errorMsg?: string) => ({
    errorMsg,
  })),
};
