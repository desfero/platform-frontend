import {
  Button,
  ButtonInline,
  EButtonLayout,
  EButtonWidth,
  Eur,
  TokenIcon,
} from "@neufund/design-system";
import { ECurrency, ENumberOutputFormat, withContainer } from "@neufund/shared";
import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { actions } from "../../../modules/actions";
import {
  selectIcbmWalletConnected,
  selectLockedWalletConnected,
  selectTotalEtherBalance,
  selectTotalEtherBalanceEuroAmount,
  selectTotalEuroBalance,
  selectTotalEuroTokenBalance,
} from "../../../modules/wallet/selectors";
import { appConnect } from "../../../store";
import { CommonHtmlProps } from "../../../types";
import { onEnterAction } from "../../../utils/react-connected-components/OnEnterAction";
import { EColumnSpan } from "../../layouts/Container";
import { DataRowSeparated } from "../../shared/DataRow";
import { LoadingIndicator } from "../../shared/loading-indicator";
import { MoneySuiteWidget } from "../../shared/MoneySuiteWidget/MoneySuiteWidget";
import { PanelRounded } from "../../shared/Panel";
import { ECustomTooltipTextPosition, Tooltip } from "../../shared/tooltips";
import { WarningAlert } from "../../shared/WarningAlert";

import ethIcon from "../../../assets/img/eth_icon.svg";
import moneyIcon from "../../../assets/img/nEUR_icon.svg";
import * as styles from "./MyWalletWidget.module.scss";

type TStateProps = {
  isLoading: boolean;
  hasError: boolean;
  data?: {
    euroTokenAmount: string;
    ethAmount: string;
    ethEuroAmount: string;
    totalAmount: string;
    isIcbmWalletConnected: boolean;
    isLockedWalletConnected: boolean;
  };
};

type TDispatchProps = {
  goToWallet: () => void;
  goToPortfolio: () => void;
};

type TComponentProps = TStateProps & TDispatchProps;

export const MyWalletWidgetError: React.FunctionComponent = () => (
  <WarningAlert data-test-id="my-wallet-error" className="m-auto">
    <FormattedMessage id="common.error" values={{ separator: <br /> }} />
  </WarningAlert>
);

export const MyWalletWidgetComponentLayout: React.FunctionComponent<TComponentProps> = props => {
  const {
    euroTokenAmount,
    ethAmount,
    ethEuroAmount,
    isIcbmWalletConnected,
    isLockedWalletConnected,
  } = props.data!;

  return (
    <>
      <DataRowSeparated
        caption={
          <>
            <TokenIcon srcSet={{ "1x": moneyIcon }} alt="" className={cn("mr-2", styles.token)} />
            <span className={styles.tokenName}>
              <FormattedMessage id="dashboard.my-wallet.neuro" />
            </span>
          </>
        }
        value={
          <MoneySuiteWidget
            currency={ECurrency.EUR_TOKEN}
            largeNumber={euroTokenAmount}
            value={euroTokenAmount}
            currencyTotal={ECurrency.EUR}
            outputFormat={ENumberOutputFormat.FULL}
            data-test-id="my-wallet-widget-eur-token"
          />
        }
      />
      <DataRowSeparated
        caption={
          <>
            <TokenIcon srcSet={{ "1x": ethIcon }} alt="" className={cn("mr-2", styles.token)} />
            <span className={styles.tokenName}>
              <FormattedMessage id="dashboard.my-wallet.ether" />
            </span>
          </>
        }
        value={
          <MoneySuiteWidget
            currency={ECurrency.ETH}
            largeNumber={ethAmount}
            value={ethEuroAmount}
            currencyTotal={ECurrency.EUR}
            outputFormat={ENumberOutputFormat.FULL}
            data-test-id="my-wallet-widget-eth-token"
          />
        }
      />
      {process.env.NF_CHECK_LOCKED_WALLET_WIDGET_ENABLED === "1" &&
        process.env.NF_CHECK_LOCKED_WALLET_WIDGET_IN_DASHBOARD === "1" &&
        !(isIcbmWalletConnected || isLockedWalletConnected) && (
          <section data-test-id="my-wallet-widget-icbm-help-text">
            <p className={styles.icbmWallet}>
              <FormattedMessage id="dashboard.my-portfolio-widget.cant-see-your-icbm-wallet" />
              <br />
              <ButtonInline onClick={props.goToPortfolio}>
                <FormattedMessage id="dashboard.my-portfolio-widget.check-it-here" />
              </ButtonInline>
              <Tooltip
                content={<FormattedMessage id="icbm-wallet.tooltip" />}
                textPosition={ECustomTooltipTextPosition.LEFT}
              />
            </p>
          </section>
        )}
      <Button
        className={styles.button}
        layout={EButtonLayout.PRIMARY}
        width={EButtonWidth.NORMAL}
        onClick={props.goToWallet}
      >
        <FormattedMessage id="dashboard.my-wallet.manage-wallet" />
      </Button>
    </>
  );
};

export const MyWalletWidgetComponentContainer: React.FunctionComponent<CommonHtmlProps &
  TComponentProps> = ({ children, ...props }) => (
  <PanelRounded
    columnSpan={EColumnSpan.ONE_COL}
    className={styles.container}
    headerText={<FormattedMessage id="dashboard.my-wallet.title" />}
    rightComponent={
      !props.isLoading &&
      !props.hasError &&
      props.data && <Eur data-test-id="my-wallet-widget-total" value={props.data.totalAmount} />
    }
  >
    {children}
  </PanelRounded>
);

export const MyWalletWidget = compose<TComponentProps, CommonHtmlProps>(
  onEnterAction({ actionCreator: d => d(actions.wallet.loadWalletData()) }),
  appConnect<TStateProps, TDispatchProps>({
    stateToProps: state => {
      const isLoading = state.wallet.loading;
      const hasError = !!state.wallet.error;

      if (!isLoading && !hasError) {
        return {
          isLoading,
          hasError,
          data: {
            euroTokenAmount: selectTotalEuroTokenBalance(state),
            ethAmount: selectTotalEtherBalance(state),
            ethEuroAmount: selectTotalEtherBalanceEuroAmount(state),
            totalAmount: selectTotalEuroBalance(state),
            isIcbmWalletConnected: selectIcbmWalletConnected(state.wallet),
            isLockedWalletConnected: selectLockedWalletConnected(state),
          },
        };
      } else {
        return {
          isLoading,
          hasError,
        };
      }
    },
    dispatchToProps: dispatch => ({
      goToWallet: () => dispatch(actions.routing.goToWallet()),
      goToPortfolio: () => dispatch(actions.routing.goToPortfolio()),
    }),
  }),
  withContainer(MyWalletWidgetComponentContainer),
  branch<TStateProps>(state => state.isLoading, renderComponent(LoadingIndicator)),
  branch<TStateProps>(state => state.hasError, renderComponent(MyWalletWidgetError)),
)(MyWalletWidgetComponentLayout);
