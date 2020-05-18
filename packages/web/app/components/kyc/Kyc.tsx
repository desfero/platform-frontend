import { withContainer } from "@neufund/shared-utils";
import * as React from "react";
import { Redirect } from "react-router";
import { branch, compose, renderComponent, withProps } from "recompose";

import {
  EKycInstantIdStatus,
  EKycRequestStatus,
  EKycRequestType,
} from "../../lib/api/kyc/KycApi.interfaces";
import { actions } from "../../modules/actions";
import { selectIsUserEmailVerified } from "../../modules/auth/selectors";
import { selectKycIdNowRedirectUrl } from "../../modules/kyc/instant-id/id-now/selectors";
import {
  selectIsKycFlowBlockedByRegion,
  selectKycInstantIdStatus,
  selectKycRequestStatus,
  selectKycRequestType,
} from "../../modules/kyc/selectors";
import { appConnect } from "../../store";
import { onEnterAction } from "../../utils/react-connected-components/OnEnterAction";
import { appRoutes } from "../appRoutes";
import { EContentWidth } from "../layouts/Content";
import { FullscreenProgressLayout } from "../layouts/FullscreenProgressLayout";
import { TContentExternalProps } from "../layouts/Layout";
import { createErrorBoundary } from "../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryLayout } from "../shared/errorBoundary/ErrorBoundaryLayout";

const KycLayout = React.lazy(() => import("./KycLayout").then(imp => ({ default: imp.KycLayout })));

interface IStateProps {
  requestStatus?: EKycRequestStatus;
  instantIdStatus: EKycInstantIdStatus | undefined;
  idNowRedirectUrl: string | undefined;
  requestType: EKycRequestType | undefined;
  hasVerifiedEmail: boolean;
  isKycFlowBlockedByRegion: boolean;
}

interface IDispatchProps {
  goToProfile: () => void;
  goToDashboard: () => void;
}

const Kyc = compose<IStateProps & IDispatchProps, {}>(
  createErrorBoundary(ErrorBoundaryLayout),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      requestStatus: selectKycRequestStatus(state),
      instantIdStatus: selectKycInstantIdStatus(state),
      idNowRedirectUrl: selectKycIdNowRedirectUrl(state),
      requestType: selectKycRequestType(state),
      hasVerifiedEmail: selectIsUserEmailVerified(state),
      isKycFlowBlockedByRegion: selectIsKycFlowBlockedByRegion(state),
    }),
    dispatchToProps: dispatch => ({
      goToProfile: () => dispatch(actions.routing.goToProfile()),
      goToDashboard: () => dispatch(actions.routing.goToDashboard()),
    }),
  }),
  branch(
    (props: IStateProps) => !props.hasVerifiedEmail || props.isKycFlowBlockedByRegion,
    renderComponent(() => <Redirect to={appRoutes.profile} />),
  ),
  onEnterAction({
    actionCreator: dispatch => {
      dispatch(actions.kyc.kycLoadStatusAndData());
    },
  }),
  withContainer(
    withProps<TContentExternalProps, {}>({ width: EContentWidth.SMALL })(FullscreenProgressLayout),
  ),
)(KycLayout);

export { Kyc };
