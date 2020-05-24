import { AppReducer } from "@neufund/sagas";
import { DeepReadonly } from "@neufund/shared-utils";

import { IUser } from "../lib/users/interfaces";
import { userActions } from "./actions";

export interface IUserState {
  data: IUser | undefined;
}

const authInitialState: IUserState = {
  data: undefined,
};

const userReducer: AppReducer<IUserState, typeof userActions> = (
  state = authInitialState,
  action,
): DeepReadonly<IUserState> => {
  switch (action.type) {
    case userActions.setUser.getType():
      return {
        ...state,
        data: action.payload.user,
      };
    case userActions.reset.getType():
      return authInitialState;
    default:
      return state;
  }
};

const userReducerMap = {
  user: userReducer,
};

export { userReducerMap };
