import { signerUIActions } from "./actions";
import { ESignerUIState, signerUIReducerMap } from "./reducer";
import { signedUISaga } from "./sagas";
import { selectSignerUIData, selectSignerUIState } from "./selectors";

const MODULE_ID = "wallet:signer-ui";

const setupSignerUIModule = () => ({
  id: MODULE_ID,
  sagas: [signedUISaga],
  reducerMap: signerUIReducerMap,
  api: signerUIModuleApi,
});

const signerUIModuleApi = {
  actions: signerUIActions,
  selectors: {
    selectSignerUIData,
    selectSignerUIState,
  },
};

export { setupSignerUIModule, signerUIModuleApi, ESignerUIState };
