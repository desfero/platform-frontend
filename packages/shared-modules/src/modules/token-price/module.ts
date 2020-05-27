import { generateSharedModuleId } from "../../utils";
import { tokenPriceActions } from "./actions";
import { tokenPriceReducerMap } from "./reducer";
import { setupTokenPriceSagas } from "./sagas";
import * as selectors from "./selectors";

const MODULE_ID = generateSharedModuleId("token-price");

type Config = Parameters<typeof setupTokenPriceSagas>[0];

const setupTokenPriceModule = (config: Config) => ({
  id: MODULE_ID,
  api: tokenPriceModuleApi,
  sagas: [setupTokenPriceSagas(config)],
  reducerMap: tokenPriceReducerMap,
});

const tokenPriceModuleApi = {
  actions: tokenPriceActions,
  reducer: tokenPriceReducerMap,
  selectors,
};

export { setupTokenPriceModule, tokenPriceModuleApi };
