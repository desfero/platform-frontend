import { ECurrency, ENumberInputFormat, ENumberOutputFormat, isZero } from "@neufund/shared";
import * as moment from "moment";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";
import { compose, withProps } from "recompose";

import { externalRoutes } from "../../../../config/externalRoutes";
import { actions } from "../../../../modules/actions";
import {
  selectEtherTokenIncomingPayout,
  selectEuroTokenIncomingPayout,
} from "../../../../modules/investor-portfolio/selectors";
import { appConnect } from "../../../../store";
import { Counter } from "../../../shared/Counter";
import { ETheme, Money } from "../../../shared/formatters/Money";

import * as styles from "./PayoutWidget.module.scss";

export interface IIncomingPayoutData {
  etherTokenIncomingPayout: string;
  euroTokenIncomingPayout: string;
  dataTestId?: string;
}

type TDispatchProps = {
  loadPayoutsData: () => void;
};

type TEndDate = {
  endDate: Date;
};

export const IncomingPayoutPendingBase: React.FunctionComponent<IIncomingPayoutData> = ({
  euroTokenIncomingPayout,
  etherTokenIncomingPayout,
  dataTestId,
  children,
}) => (
  <div className={styles.main} data-test-id={dataTestId}>
    <h3 className={styles.header}>
      <FormattedMessage id="dashboard.incoming-payout-widget.incoming-payout" />
    </h3>
    {children}
    <div>
      {!isZero(euroTokenIncomingPayout) && (
        <Money
          value={euroTokenIncomingPayout}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          valueType={ECurrency.EUR_TOKEN}
          data-test-id="incoming-payout-euro-token"
          className={styles.incomingValue}
          theme={ETheme.GREEN}
        />
      )}
      {!isZero(euroTokenIncomingPayout) && !isZero(etherTokenIncomingPayout) && (
        <span className={styles.incomingValue}> & </span>
      )}
      {!isZero(etherTokenIncomingPayout) && (
        <Money
          value={etherTokenIncomingPayout}
          inputFormat={ENumberInputFormat.ULPS}
          valueType={ECurrency.ETH}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          data-test-id="incoming-payout-ether-token"
          className={styles.incomingValue}
          theme={ETheme.GREEN}
        />
      )}
    </div>
    <p className={styles.statementText}>
      <FormattedMessage id="dashboard.incoming-payout-widget.wallet-statement" />
    </p>
    <p className={styles.statementText}>
      <FormattedHTMLMessage
        tagName="span"
        id="dashboard.incoming-payout-widget.read-more"
        values={{ href: externalRoutes.incomingPayoutBlogPost }}
      />
    </p>
  </div>
);

export const IncomingPayoutPendingLayout: React.FunctionComponent<IIncomingPayoutData &
  TDispatchProps &
  TEndDate> = ({ endDate, loadPayoutsData, etherTokenIncomingPayout, euroTokenIncomingPayout }) => (
  <IncomingPayoutPendingBase
    dataTestId="my-portfolio-widget-incoming-payout-pending"
    etherTokenIncomingPayout={etherTokenIncomingPayout}
    euroTokenIncomingPayout={euroTokenIncomingPayout}
  >
    <Counter
      data-test-id="incoming-payout-counter"
      className={styles.counterWidget}
      endDate={endDate}
      onFinish={loadPayoutsData}
    />
  </IncomingPayoutPendingBase>
);

export const IncomingPayoutPending = compose<IIncomingPayoutData & TDispatchProps & TEndDate, {}>(
  appConnect({
    stateToProps: s => ({
      etherTokenIncomingPayout: selectEtherTokenIncomingPayout(s),
      euroTokenIncomingPayout: selectEuroTokenIncomingPayout(s),
    }),
    dispatchToProps: d => ({
      loadPayoutsData: () => {
        d(actions.investorEtoTicket.getIncomingPayouts());
        d(actions.investorEtoTicket.loadClaimables());
      },
    }),
  }),
  withProps<TEndDate, IIncomingPayoutData>({
    endDate: moment()
      .utc()
      .add(1, "day")
      .startOf("day")
      .toDate(),
  }),
)(IncomingPayoutPendingLayout);
