import { EButtonLayout } from "@neufund/design-system";
import { walletApi } from "@neufund/shared-modules";
import { withContainer } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { externalRoutes } from "../../../../config/externalRoutes";
import { actions } from "../../../../modules/actions";
import {
  selectIncomingPayoutError,
  selectIncomingPayoutEurEquiv,
  selectIsIncomingPayoutLoading,
  selectIsIncomingPayoutNotInitialized,
  selectIsIncomingPayoutPending,
  selectPayoutAvailable,
  selectTokensDisbursalError,
  selectTokensDisbursalEurEquivTotal,
  selectTokensDisbursalIsLoading,
  selectTokensDisbursalNotInitialized,
} from "../../../../modules/investor-portfolio/selectors";
import { appConnect } from "../../../../store";
import { onEnterAction } from "../../../../utils/react-connected-components/OnEnterAction";
import { ButtonLink } from "../../../shared/buttons/ButtonLink";
import { ECurrency } from "../../../shared/formatters/utils";
import {
  ELoadingIndicator,
  LoadingIndicator,
} from "../../../shared/loading-indicator/LoadingIndicator";
import { MoneySuiteWidget } from "../../../shared/MoneySuiteWidget/MoneySuiteWidget";
import { ETheme } from "../../../shared/transaction/TransactionData";
import { MyNeuWidgetError } from "./MyNeuWidgetError";
import { MyNeuWidgetPayout } from "./MyNeuWidgetPayout";

import icon from "../../../../assets/img/neu_icon.svg";
import * as styles from "./MyNeuWidget.module.scss";

type TStateProps = {
  isLoading: boolean;
  error: boolean;
  balanceNeu: string;
  balanceEur: string;
  isPayoutAvailable: boolean;
  isPayoutPending: boolean;
  tokensDisbursalEurEquiv: string | undefined;
  incomingPayoutEurEquiv: string;
};

export type TDispatchProps = {
  goToPortfolio: () => void;
  loadPayoutsData: () => void;
};

type TComponentProps = {
  balanceNeu: string;
  balanceEur: string;
  isPayoutAvailable: boolean;
  isPayoutPending: boolean;
  tokensDisbursalEurEquiv: string | undefined;
  incomingPayoutEurEquiv: string;
  goToPortfolio: () => void;
  loadPayoutsData: () => void;
};

export const MyNeuWidgetLayoutWrapper: React.FunctionComponent = ({ children }) => (
  <section className={styles.wrapper}>
    <h4 className={styles.title}>
      <FormattedMessage id="dashboard.my-neu-widget.my-neumark" />
    </h4>
    {children}
  </section>
);

export const MyNeuWidgetLayout: React.FunctionComponent<TComponentProps> = props => (
  <>
    <div className={styles.content}>
      <MoneySuiteWidget
        currency={ECurrency.NEU}
        largeNumber={props.balanceNeu}
        icon={icon}
        value={props.balanceEur}
        currencyTotal={ECurrency.EUR}
        data-test-id="my-neu-widget-neumark-balance"
        transactionTheme={ETheme.SILVER_LIGHT}
      />
      <MyNeuWidgetPayout {...props} />
      {!props.isPayoutAvailable && !props.isPayoutPending && (
        <ButtonLink
          to={externalRoutes.neufundSupportWhatIsNeu}
          target="_blank"
          layout={EButtonLayout.SECONDARY}
          data-test-id="my-neu-widget-support-link"
          className={styles.button}
        >
          <FormattedMessage id="dashboard.my-neu-widget.about" />
        </ButtonLink>
      )}
    </div>
  </>
);

export const MyNeuWidget = compose<TComponentProps, {}>(
  onEnterAction({
    actionCreator: dispatch => {
      dispatch(actions.investorEtoTicket.getIncomingPayouts());
      dispatch(actions.investorEtoTicket.loadClaimables());
    },
  }),
  appConnect<TStateProps>({
    stateToProps: state => ({
      isLoading:
        walletApi.selectors.selectIsLoading(state) ||
        (selectIsIncomingPayoutNotInitialized(state) && selectIsIncomingPayoutLoading(state)) ||
        (selectTokensDisbursalNotInitialized(state) && selectTokensDisbursalIsLoading(state)),
      error:
        !!walletApi.selectors.selectWalletError(state) ||
        selectIncomingPayoutError(state) ||
        selectTokensDisbursalError(state),
      balanceNeu: walletApi.selectors.selectNeuBalance(state),
      balanceEur: walletApi.selectors.selectNeuBalanceEuroAmount(state),
      isPayoutPending: selectIsIncomingPayoutPending(state),
      isPayoutAvailable: selectPayoutAvailable(state),
      tokensDisbursalEurEquiv: selectTokensDisbursalEurEquivTotal(state),
      incomingPayoutEurEquiv: selectIncomingPayoutEurEquiv(state),
    }),
    dispatchToProps: dispatch => ({
      goToPortfolio: () => dispatch(actions.routing.goToPortfolio()),
      loadPayoutsData: () => {
        dispatch(actions.investorEtoTicket.getIncomingPayouts());
        dispatch(actions.investorEtoTicket.loadClaimables());
      },
    }),
  }),
  withContainer(MyNeuWidgetLayoutWrapper),
  branch<TStateProps>(({ error }) => error, renderComponent(MyNeuWidgetError)),
  branch<TStateProps>(
    ({ isLoading }) => isLoading,
    renderComponent(() => (
      <LoadingIndicator type={ELoadingIndicator.PULSE_WHITE} className="m-auto" />
    )),
  ),
)(MyNeuWidgetLayout);
