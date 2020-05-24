import { authModuleAPI } from "@neufund/shared-modules";
import { StateFromReducersMapObject } from "redux";
import { createSelector } from "reselect";

import { authReducerMap } from "./reducer";

const selectAuth = (state: StateFromReducersMapObject<typeof authReducerMap>) => state.auth;

const selectAuthState = createSelector(selectAuth, auth => auth.state);
const selectAuthWallet = createSelector(selectAuth, auth => auth.wallet);

const selectUser = authModuleAPI.selectors.selectUser;

export { selectAuthState, selectUser, selectAuthWallet };
