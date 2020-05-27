import { createActionFactory } from "@neufund/shared-utils";

import { GasModelShape } from "./lib/http/gas-api/GasApi";

export const gasActions = {
  gasApiEnsureLoading: createActionFactory("GAS_API_ENSURE_LOADING"),
  gasApiStartLoading: createActionFactory("GAS_API_START_LOADING"),
  gasApiLoaded: createActionFactory(
    "GAS_API_LOADED",
    (payload: { data?: GasModelShape; error?: string }) => payload,
  ),
};
