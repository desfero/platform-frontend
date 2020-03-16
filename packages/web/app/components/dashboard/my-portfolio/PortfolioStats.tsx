import { Button, EButtonLayout, EButtonWidth, TokenIcon } from "@neufund/design-system";
import {
  convertToUlps,
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  multiplyBigNumbers,
  nonNullable,
  OmitKeys,
  withContainer,
} from "@neufund/shared";
import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { actions } from "../../../modules/actions";
import { selectIsVerifiedInvestor } from "../../../modules/auth/selectors";
import { selectEtosError } from "../../../modules/eto/selectors";
import {
  selectMyAssetsEurEquivTotal,
  selectMyAssetsWithTokenData,
} from "../../../modules/investor-portfolio/selectors";
import { TETOWithTokenData } from "../../../modules/investor-portfolio/types";
import { appConnect } from "../../../store";
import { DataRowSeparated } from "../../shared/DataRow";
import { Money } from "../../shared/formatters/Money";
import { LoadingIndicator } from "../../shared/loading-indicator/LoadingIndicator";
import { MoneySuiteWidget } from "../../shared/MoneySuiteWidget/MoneySuiteWidget";
import { ESize } from "../../shared/transaction/TransactionData";
import { WarningAlert } from "../../shared/WarningAlert";

import styles from "./PortfolioStats.module.scss";

type TStateProps = {
  myAssets: TETOWithTokenData[] | undefined;
  myAssetsEurEquivTotal: string | undefined;
  hasError: boolean;
  isVerifiedInvestor: boolean;
};

type TDispatchProps = {
  goToPortfolio: () => void;
  goToProfile: () => void;
};

type TPortfolioStatsProps = TStateProps & TDispatchProps;

const PortfolioStatsLayoutContainer: React.FunctionComponent<Pick<
  TStateProps,
  "myAssetsEurEquivTotal"
>> = ({ children, myAssetsEurEquivTotal }) => (
  <section data-test-id="dashboard.portfolio-stats" className={styles.container}>
    <DataRowSeparated
      className={styles.header}
      caption={
        <h4 className={styles.title}>
          <FormattedMessage id="dashboard.portfolio-stats.title" />
        </h4>
      }
      value={
        myAssetsEurEquivTotal && (
          <Money
            value={myAssetsEurEquivTotal}
            inputFormat={ENumberInputFormat.ULPS}
            valueType={ECurrency.EUR}
            outputFormat={ENumberOutputFormat.FULL}
          />
        )
      }
    />
    {children}
  </section>
);

const PortfolioStatsErrorLayout: React.FunctionComponent = () => (
  <WarningAlert className="m-auto" data-test-id="portfolio-stats-error">
    <FormattedMessage id="common.error" values={{ separator: <br /> }} />
  </WarningAlert>
);

const PortfolioStatsNoAssetsLayout: React.FunctionComponent<Pick<
  TDispatchProps,
  "goToPortfolio"
>> = ({ goToPortfolio }) => (
  <>
    <p className={styles.noAssets}>
      <FormattedMessage id="dashboard.portfolio-stats.no-assets" />
    </p>
    <Button
      className={styles.button}
      layout={EButtonLayout.PRIMARY}
      width={EButtonWidth.NORMAL}
      onClick={goToPortfolio}
    >
      <FormattedMessage id="dashboard.portfolio-stats.view-portfolio" />
    </Button>
  </>
);

const PortfolioStatsLayout: React.FunctionComponent<OmitKeys<TPortfolioStatsProps, "hasError">> = ({
  myAssets,
  goToPortfolio,
}) => {
  const assets = nonNullable(myAssets);

  return (
    <>
      {assets.slice(0, 3).map(eto => (
        <DataRowSeparated
          key={eto.equityTokenName}
          className={styles.row}
          caption={
            <>
              <TokenIcon
                srcSet={{ "1x": eto.equityTokenImage }}
                alt=""
                className={cn("mr-2", styles.token)}
              />
              <span className={styles.tokenName}>{eto.equityTokenName}</span>
            </>
          }
          value={
            <MoneySuiteWidget
              outputFormat={ENumberOutputFormat.FULL}
              currency={eto.equityTokenSymbol}
              largeNumber={convertToUlps(eto.tokenData.balance)}
              value={multiplyBigNumbers([eto.tokenData.tokenPrice, eto.tokenData.balance])}
              currencyTotal={ECurrency.EUR}
              size={ESize.MEDIUM}
              inputFormat={ENumberInputFormat.ULPS}
            />
          }
        />
      ))}
      <Button
        className={styles.button}
        layout={EButtonLayout.PRIMARY}
        width={EButtonWidth.NORMAL}
        onClick={goToPortfolio}
      >
        {assets.length > 3 ? (
          <FormattedMessage id="dashboard.portfolio-stats.view-more" />
        ) : (
          <FormattedMessage id="dashboard.portfolio-stats.view-portfolio" />
        )}
      </Button>
    </>
  );
};

const PortfolioStats = compose<TPortfolioStatsProps, {}>(
  appConnect<TStateProps, TDispatchProps, {}>({
    stateToProps: state => ({
      myAssets: selectMyAssetsWithTokenData(state),
      myAssetsEurEquivTotal: selectMyAssetsEurEquivTotal(state),
      hasError: selectEtosError(state),
      isVerifiedInvestor: selectIsVerifiedInvestor(state),
    }),
    dispatchToProps: dispatch => ({
      goToPortfolio: () => dispatch(actions.routing.goToPortfolio()),
      goToProfile: () => dispatch(actions.routing.goToProfile()),
    }),
  }),
  withContainer(PortfolioStatsLayoutContainer),
  branch<TStateProps>(state => state.hasError, renderComponent(PortfolioStatsErrorLayout)),
  branch<TStateProps>(state => !state.myAssets, renderComponent(LoadingIndicator)),
  branch<TStateProps>(
    state => !!state.myAssets && state.myAssets.length === 0,
    renderComponent(PortfolioStatsNoAssetsLayout),
  ),
)(PortfolioStatsLayout);

export {
  PortfolioStatsLayout,
  PortfolioStats,
  PortfolioStatsNoAssetsLayout,
  PortfolioStatsErrorLayout,
  PortfolioStatsLayoutContainer,
};
