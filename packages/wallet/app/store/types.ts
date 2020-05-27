import { TModuleState, TModuleActions } from "@neufund/shared-modules";

import { setupInitModule } from "modules/init/module";

export type TAppGlobalActions = TModuleActions<typeof setupInitModule>;
export type TAppGlobalState = TModuleState<typeof setupInitModule>;
