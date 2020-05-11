import * as React from "react";
import { compose } from "recompose";

import { actions } from "../../../modules/actions";
import {
  selectIsThereUnverifiedEmail,
  selectIsUserEmailVerified,
  selectUnverifiedUserEmail,
  selectVerifiedUserEmail,
} from "../../../modules/auth/selectors";
import { selectIsCancelEmail } from "../../../modules/profile/reducer";
import { selectIsConnectedButtonLocked } from "../../../modules/verify-email-widget/reducer";
import { appConnect } from "../../../store";

interface IStateProps {
  isUserEmailVerified: boolean;
  isThereUnverifiedEmail: boolean;
  verifiedEmail?: string;
  unverifiedEmail?: string;
  isLocked?: boolean;
  isEmailTemporaryCancelled: boolean;
}

interface IDispatchProps {
  resendEmail: () => void;
  addNewEmail: (values: { email: string }) => void;
  cancelEmail: () => void;
  revertCancelEmail: () => void;
  abortEmailUpdate: () => void;
}

const connectVerifyEmailComponent = <T extends {}>(
  WrappedComponent: React.ComponentType<IStateProps & IDispatchProps & T>,
) =>
  compose<IStateProps & IDispatchProps & T, T>(
    appConnect<IStateProps, IDispatchProps, T>({
      stateToProps: s => ({
        isUserEmailVerified: selectIsUserEmailVerified(s.auth),
        isThereUnverifiedEmail: selectIsThereUnverifiedEmail(s.auth),
        isEmailTemporaryCancelled: selectIsCancelEmail(s.profile),
        verifiedEmail: selectVerifiedUserEmail(s.auth),
        unverifiedEmail: selectUnverifiedUserEmail(s.auth),
        isLocked: selectIsConnectedButtonLocked(s.verifyEmailWidgetState),
      }),
      dispatchToProps: dispatch => ({
        resendEmail: () => {
          dispatch(actions.profile.resendEmail());
        },
        addNewEmail: (values: { email: string }) => {
          dispatch(actions.profile.addNewEmail(values.email));
        },
        cancelEmail: () => {
          dispatch(actions.profile.cancelEmail());
        },
        revertCancelEmail: () => dispatch(actions.profile.revertCancelEmail()),
        abortEmailUpdate: () => dispatch(actions.profile.abortEmailUpdate()),
      }),
    }),
  )(WrappedComponent);

export { connectVerifyEmailComponent };
