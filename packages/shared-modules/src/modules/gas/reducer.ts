import { AppReducer } from "@neufund/sagas";
import { DeepReadonly } from "@neufund/shared-utils";

import { gasActions } from "./actions";
import { GasModelShape } from "./lib/http/gas-api/GasApi";

export interface IGasState {
  loading: boolean;
  gasPrice?: GasModelShape;
  error?: string;
}

export const gasInitialState: IGasState = {
  loading: false,
};

export const gasReducer: AppReducer<IGasState, typeof gasActions> = (
  state = gasInitialState,
  action,
): DeepReadonly<IGasState> => {
  switch (action.type) {
    case gasActions.gasApiStartLoading.getType():
      return {
        ...state,
        loading: true,
      };
    case gasActions.gasApiLoaded.getType():
      return {
        ...state,
        gasPrice: action.payload.data || state.gasPrice,
        error: action.payload.error,
      };
  }

  return state;
};

const gasReducerMap = {
  gas: gasReducer,
};

export { gasReducerMap };
