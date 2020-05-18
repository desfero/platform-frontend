import { DeepReadonly } from "@neufund/shared-utils";

import { AppReducer } from "../../store";
import { actions } from "../actions";

export enum EAuthStatus {
  AUTHORIZED = "authorized",
  NON_AUTHORIZED = "non-authorized",
  LOGOUT_IN_PROGRESS = "logoutInProgress",
}

export interface IAuthState {
  status: EAuthStatus;
  currentAgreementHash: string | undefined;
}

const authInitialState: IAuthState = {
  status: EAuthStatus.NON_AUTHORIZED,
  currentAgreementHash: undefined,
};

export const authReducer: AppReducer<IAuthState> = (
  state = authInitialState,
  action,
): DeepReadonly<IAuthState> => {
  switch (action.type) {
    case actions.auth.logout.getType():
      return {
        ...state,
        status: EAuthStatus.LOGOUT_IN_PROGRESS,
      };
    case actions.auth.logoutDone.getType():
      return authInitialState;

    case actions.auth.finishSigning.getType():
      return {
        ...state,
        status: EAuthStatus.AUTHORIZED,
      };
    case actions.tosModal.setCurrentTosHash.getType():
      return {
        ...state,
        currentAgreementHash: action.payload.currentAgreementHash,
      };
  }

  return state;
};
