import {
  ICounterState,
  counterReducer,
  ICounterIncrementAction,
  ICounterDecrementAction,
} from "./modules/counter/index";
import { combineReducers } from "redux";

export interface IAppAction {
  type: string;
  payload?: any;
}
export type ActionType<T extends IAppAction> = T["type"];
export type ActionPayload<T extends IAppAction> = T["payload"];

export type AppActionTypes = ICounterIncrementAction | ICounterDecrementAction;

export type AppDispatch = (a: AppActionTypes) => void;

export type AppReducer<S> = (state: Readonly<S>, action: AppActionTypes) => S;

export interface IAppState {
  counterState: ICounterState;
}

export const reducers = combineReducers<IAppState>({
  counterState: counterReducer,
});
