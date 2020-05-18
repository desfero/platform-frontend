import { AppReducer } from "@neufund/sagas";

import { initActions } from "./actions";
import { EInitStatus } from "./types";

type TInitState = {
  status: EInitStatus;
};

const initInitialState: TInitState = {
  status: EInitStatus.NOT_STARTER,
};

const initReducer: AppReducer<TInitState, typeof initActions> = (
  state = initInitialState,
  action,
) => {
  switch (action.type) {
    case initActions.start.getType():
      return {
        ...state,
        status: EInitStatus.IN_PROGRESS,
      };
    case initActions.done.getType():
      return {
        ...state,
        status: EInitStatus.DONE,
      };
    case initActions.error.getType():
      return {
        ...state,
        status: EInitStatus.ERROR,
      };
    default:
      return state;
  }
};

const initReducersMap = {
  init: initReducer,
};

export { initReducersMap };
