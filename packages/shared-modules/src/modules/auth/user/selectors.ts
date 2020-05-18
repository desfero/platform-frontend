import { StateFromReducersMapObject } from "redux";

import { IUser } from "../lib/users/interfaces";
import { userReducerMap } from "./reducer";

type TState = StateFromReducersMapObject<typeof userReducerMap>;

const selectUser = (state: TState): IUser | undefined => state.user.data;

export { selectUser };
