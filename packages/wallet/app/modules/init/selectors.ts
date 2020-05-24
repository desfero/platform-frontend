import { StateFromReducersMapObject } from "redux";

import { initReducersMap } from "./reducer";

const selectInitStatus = (state: StateFromReducersMapObject<typeof initReducersMap>) =>
  state.init.status;

export { selectInitStatus };
