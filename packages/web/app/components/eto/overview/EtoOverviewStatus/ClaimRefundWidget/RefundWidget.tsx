import { Button } from "@neufund/design-system";
import { EUserType } from "@neufund/shared-modules";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose, withProps } from "recompose";

import { actions } from "../../../../../modules/actions";
import { selectUserType } from "../../../../../modules/auth/selectors";
import { EETOStateOnChain } from "../../../../../modules/eto/types";
import {
  selectHasInvestorTicket,
  selectInvestorTicket,
} from "../../../../../modules/investor-portfolio/selectors";
import {
  EUserRefundStatus,
  IInvestorTicket,
} from "../../../../../modules/investor-portfolio/types";
import { getRefundStatus } from "../../../../../modules/investor-portfolio/utils";
import { appConnect } from "../../../../../store";

import * as style from "./RefundWidget.module.scss";

interface IExternalProps {
  etoId: string;
  timedState: EETOStateOnChain;
}

interface IStateProps {
  doesInvestorInvest: boolean;
  userType: EUserType | undefined;
  investorTicket?: IInvestorTicket;
}

interface IDispatchProps {
  onRefund: () => void;
}

interface IWithProps {
  claimStatus: EUserRefundStatus;
}

type TComponentProps = IExternalProps & IStateProps & IDispatchProps & IWithProps;

const RefundActionWidget: React.FunctionComponent<IWithProps & IDispatchProps> = ({
  claimStatus,
  onRefund,
}) => {
  switch (claimStatus) {
    case EUserRefundStatus.CAN_CLAIM:
      return (
        <Button onClick={onRefund} data-test-id="eto-overview-claim-your-refund">
          <FormattedMessage id="shared-component.eto-overview.claim-your-refund" />
        </Button>
      );
    case EUserRefundStatus.CLAIMED:
      return (
        <small className="text-center" data-test-id="eto-overview-refund-claimed">
          <FormattedMessage id="shared-component.eto-overview.already-refunded" />
        </small>
      );
    case EUserRefundStatus.CANNOT_CLAIM:
    default:
      return null;
  }
};

const RefundWidgetLayout: React.FunctionComponent<TComponentProps> = ({
  onRefund,
  claimStatus,
}) => (
  <>
    <p className={style.message}>
      <FormattedMessage id="shared-component.eto-overview.refund" />
    </p>

    <RefundActionWidget onRefund={onRefund} claimStatus={claimStatus} />
  </>
);

export const RefundWidget = compose<TComponentProps, IExternalProps>(
  appConnect<IStateProps, IDispatchProps, IExternalProps>({
    stateToProps: (state, props) => ({
      doesInvestorInvest: selectHasInvestorTicket(state, props.etoId),
      investorTicket: selectInvestorTicket(state, props.etoId),
      userType: selectUserType(state),
    }),
    dispatchToProps: (dispatch, ownProps) => ({
      onRefund: () => dispatch(actions.txTransactions.startInvestorRefund(ownProps.etoId)),
    }),
  }),
  withProps<IWithProps, IExternalProps & IStateProps & IDispatchProps>(props => ({
    claimStatus: getRefundStatus(
      props.timedState,
      props.userType,
      props.doesInvestorInvest,
      props.investorTicket,
    ),
  })),
)(RefundWidgetLayout);
