import { TModuleState } from "../../types";
import { setupGasModule } from "./module";

export type TGasModuleState = TModuleState<typeof setupGasModule>;
