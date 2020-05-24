import { StateFromReducersMapObject } from "redux";
import { createSelector } from "reselect";

import { signerUIReducerMap } from "./reducer";

const selectSignerUI = (state: StateFromReducersMapObject<typeof signerUIReducerMap>) =>
  state.signerUI;

const selectSignerUIState = createSelector(selectSignerUI, signerUi => signerUi.state);
const selectSignerUIData = createSelector(selectSignerUI, signerUi => signerUi.data);

export { selectSignerUIState, selectSignerUIData };
