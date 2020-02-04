import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderNothing } from "recompose";

import { externalRoutes } from "../../../../config/externalRoutes";
import { actions } from "../../../../modules/actions";
import {
  selectIncomingPayoutEurEquiv,
  selectIsIncomingPayoutPending,
} from "../../../../modules/investor-portfolio/selectors";
import { appConnect } from "../../../../store";
import { ButtonInline } from "../../../shared/buttons/ButtonInline";
import { ButtonLink } from "../../../shared/buttons/ButtonLink";
import { ETheme, Money } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../shared/formatters/utils";
import { InlineIcon } from "../../../shared/icons/InlineIcon";
import { TimeLeftWithSeconds } from "../../../shared/TimeLeft.unsafe";
import { getTomorrowsDate } from "../../../shared/utils";
import { TPayoutProps } from "./MyNeuWidgetPayout";

import warningIcon from "../../../../assets/img/inline_icons/warning-circle--gray.svg";
import * as styles from "./MyNeuWidget.module.scss";

type TStateProps = {
  incomingPayoutEurEquiv: string;
  isIncomingPayoutPending: boolean;
};

type TDispatchProps = {
  loadPayoutsData: () => void;
};

type TPendingPayoutProps = TStateProps & TDispatchProps;

const MyNeuWidgetPendingPayoutLayout: React.FunctionComponent<TPendingPayoutProps> = ({
  incomingPayoutEurEquiv,
  loadPayoutsData,
}) => (
  <section className={styles.payoutContainer} data-test-id="my-neu-widget-payout-pending">
    <InlineIcon svgIcon={warningIcon} className={styles.warningIcon} />
    <div>
      <FormattedMessage
        id="dashboard.my-neu-widget.pending-payout"
        values={{
          separator: <br />,
          time: (
            <TimeLeftWithSeconds
              finalTime={getTomorrowsDate()}
              refresh={true}
              onFinish={loadPayoutsData}
            />
          ),
          amount: (
            <Money
              value={incomingPayoutEurEquiv}
              inputFormat={ENumberInputFormat.ULPS}
              valueType={ECurrency.EUR}
              outputFormat={ENumberOutputFormat.FULL}
              theme={ETheme.GREEN}
              className={cn(styles.payoutAmount, "text-nowrap")}
            />
          ),
        }}
      />
      <ButtonLink
        to={externalRoutes.incomingPayoutBlogPost}
        component={ButtonInline}
        className={styles.buttonPayout}
      >
        <FormattedMessage id="dashboard.my-neu-widget.pending-payout-more" />
      </ButtonLink>
    </div>
  </section>
);

const MyNeuWidgetPendingPayout = compose<TPendingPayoutProps, TPayoutProps>(
  appConnect<TStateProps, TDispatchProps>({
    stateToProps: state => ({
      incomingPayoutEurEquiv: selectIncomingPayoutEurEquiv(state),
      isIncomingPayoutPending: selectIsIncomingPayoutPending(state),
    }),
    dispatchToProps: dispatch => ({
      loadPayoutsData: () => {
        dispatch(actions.investorEtoTicket.getIncomingPayouts());
        dispatch(actions.investorEtoTicket.loadClaimables());
      },
    }),
  }),
  branch<TStateProps>(({ isIncomingPayoutPending }) => !isIncomingPayoutPending, renderNothing),
)(MyNeuWidgetPendingPayoutLayout);

export { MyNeuWidgetPendingPayoutLayout, MyNeuWidgetPendingPayout };
