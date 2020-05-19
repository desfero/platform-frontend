import { StateFromReducersMapObject } from "redux";
import { createSelector } from "reselect";

import { EUserType, IUser } from "../lib/users/interfaces";
import { userReducerMap } from "./reducer";

type TState = StateFromReducersMapObject<typeof userReducerMap>;

const selectUser = (state: TState): IUser | undefined => state.user.data;

export const selectUserType = createSelector(
  selectUser,
  (user: IUser | undefined): EUserType | undefined => user?.type,
);

export { selectUser };
