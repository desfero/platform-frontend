import { RESULTS as PERMISSION_RESULTS } from "react-native-permissions";

import { setupBindings } from "./bindings";
import { symbols } from "./symbols";

const MODULE_ID = "permissions";

const setupPermissionsModule = () => ({
  id: MODULE_ID,
  libs: [setupBindings()],
  api: permissionsModuleApi,
});

const permissionsModuleApi = {
  symbols,
};

export { setupPermissionsModule, permissionsModuleApi, PERMISSION_RESULTS };
