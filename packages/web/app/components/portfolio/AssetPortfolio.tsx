import { Button, EButtonLayout, Table } from "@neufund/design-system";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  selectUnits,
  withContainer,
} from "@neufund/shared";
import * as cn from "classnames";
import * as React from "react";
import { FormattedDate } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { externalRoutes } from "../../config/externalRoutes";
import { actions } from "../../modules/actions";
import { ITokenDisbursal } from "../../modules/investor-portfolio/types";
import { appConnect } from "../../store";
import { Container } from "../layouts/Container";
import { Money } from "../shared/formatters/Money";
import { MoneyWithLessThan } from "../shared/formatters/MoneyWithLessThan";
import { Heading } from "../shared/Heading";
import { CurrencyIcon } from "../shared/icons/CurrencyIcon";
import { ExternalLink } from "../shared/links/ExternalLink";
import { LoadingIndicator } from "../shared/loading-indicator/LoadingIndicator";
import { PanelRounded } from "../shared/Panel";
import { Tooltip } from "../shared/tooltips/Tooltip";
import { ECustomTooltipTextPosition } from "../shared/tooltips/TooltipBase";
import { WarningAlert } from "../shared/WarningAlert";

import * as styles from "./PortfolioLayout.module.scss";

interface IExternalProps {
  tokensDisbursal: ReadonlyArray<ITokenDisbursal> | undefined;
  isVerifiedInvestor: boolean;
  tokenDisbursalIsLoading: boolean;
  tokenDisbursalError: boolean;
  tokensDisbursalEurEquivTotal: string;
  tokensDisbursalEurEquivTotalDisbursed: string;
}

interface ILayoutProps {
  tokensDisbursal: ReadonlyArray<ITokenDisbursal>;
  isVerifiedInvestor: boolean;
  tokensDisbursalEurEquivTotal: string;
  tokensDisbursalEurEquivTotalDisbursed: string;
}

interface IDispatchToProps {
  redistributePayout: (tokenDisbursal: ITokenDisbursal) => void;
  acceptPayout: (tokenDisbursal: ITokenDisbursal) => void;
  acceptCombinedPayout: (tokensDisbursal: ReadonlyArray<ITokenDisbursal>) => void;
}

const AssetPortfolioLayoutNoPayouts: React.FunctionComponent = () => (
  <p className="m-auto" data-test-id="asset-portfolio.no-payouts">
    <FormattedMessage id="portfolio.asset.payouts-from-neu.no-payouts" />
  </p>
);

const prepareTableRowData = (
  tokenDisbursal: readonly ITokenDisbursal[],
  isVerifiedInvestor: boolean,
  redistributePayout: (tokenDisbursal: ITokenDisbursal) => void,
  acceptPayout: (tokenDisbursal: ITokenDisbursal) => void,
) =>
  tokenDisbursal.map(disbursal => ({
    tokenInfo: (
      <span className={styles.tokenName}>
        <CurrencyIcon currency={disbursal.token} className={cn("mr-2", styles.token)} />
        {selectUnits(disbursal.token)}
      </span>
    ),
    yourShare: (
      <MoneyWithLessThan
        value={disbursal.amountToBeClaimed}
        inputFormat={ENumberInputFormat.ULPS}
        valueType={disbursal.token}
        outputFormat={ENumberOutputFormat.FULL}
        data-test-id={`asset-portfolio.payout.amount-to-be-claimed`}
      />
    ),
    totalPayout: (
      <MoneyWithLessThan
        value={disbursal.totalDisbursedAmount}
        inputFormat={ENumberInputFormat.ULPS}
        valueType={disbursal.token}
        outputFormat={ENumberOutputFormat.FULL}
      />
    ),
    acceptBy: (
      <FormattedDate
        day="2-digit"
        year="numeric"
        month="short"
        value={disbursal.timeToFirstDisbursalRecycle}
      />
    ),
    actions: (
      <div data-test-id={`asset-portfolio.payout-${disbursal.token}`}>
        <Button
          disabled={!isVerifiedInvestor}
          data-test-id="asset-portfolio.payout.redistribute-payout"
          onClick={() => redistributePayout(disbursal)}
          layout={EButtonLayout.OUTLINE}
          className="mr-3"
        >
          <FormattedMessage id="portfolio.asset.payouts-from-neu.redistribute-payout" />
        </Button>
        <Button
          disabled={!isVerifiedInvestor}
          data-test-id="asset-portfolio.payout.accept-payout"
          onClick={() => acceptPayout(disbursal)}
          layout={EButtonLayout.PRIMARY}
        >
          <FormattedMessage id="portfolio.asset.payouts-from-neu.accept-payout" />
        </Button>
      </div>
    ),
  }));

const prepareTableColumns = (
  tokensDisbursalEurEquivTotal: string,
  tokensDisbursalEurEquivTotalDisbursed: string,
  isVerifiedInvestor: boolean,
  acceptCombinedPayout: (tokensDisbursal: ReadonlyArray<ITokenDisbursal>) => void,
  tokensDisbursal: readonly ITokenDisbursal[],
) => [
  {
    Header: <FormattedMessage id="portfolio.asset.payouts-from-neu.token" />,
    accessor: "tokenInfo",
    Footer: <FormattedMessage id="portfolio.asset.payouts-from-neu.totals" />,
  },
  {
    Header: <FormattedMessage id="portfolio.asset.payouts-from-neu.total-payout" />,
    accessor: "totalPayout",
    Footer: () => (
      <>
        ~
        <Money
          value={tokensDisbursalEurEquivTotalDisbursed}
          inputFormat={ENumberInputFormat.ULPS}
          valueType={ECurrency.EUR}
          outputFormat={ENumberOutputFormat.FULL}
        />
      </>
    ),
  },
  {
    Header: <FormattedMessage id="portfolio.asset.payouts-from-neu.your-share" />,
    accessor: "yourShare",
    Footer: () => (
      <>
        ~
        <Money
          value={tokensDisbursalEurEquivTotal}
          inputFormat={ENumberInputFormat.ULPS}
          valueType={ECurrency.EUR}
          outputFormat={ENumberOutputFormat.FULL}
        />
      </>
    ),
  },
  {
    Header: <FormattedMessage id="portfolio.asset.payouts-from-neu.claim-by" />,
    accessor: "acceptBy",
  },
  {
    Header: "",
    accessor: "actions",
    Footer: () => (
      <Button
        disabled={!isVerifiedInvestor}
        data-test-id="asset-portfolio.payout.accept-all-payouts"
        onClick={() => acceptCombinedPayout(tokensDisbursal)}
        layout={EButtonLayout.PRIMARY}
      >
        <FormattedMessage id="portfolio.asset.payouts-from-neu.accept-all-payout" />
      </Button>
    ),
  },
];

const AssetPortfolioLayoutContainer: React.FunctionComponent = ({ children }) => (
  <>
    <Container className={styles.container}>
      <Heading level={4} decorator={false}>
        <FormattedMessage id="portfolio.section.asset-portfolio.title" />
        <Tooltip
          data-test-id="asset-portfolio.payout.community-tooltip"
          content={
            <FormattedMessage
              id="portfolio.section.asset-portfolio.tooltip"
              values={{
                link: (
                  <ExternalLink
                    href={externalRoutes.neufundCommunity}
                    data-test-id="asset-portfolio.payout.community-link"
                  >
                    <FormattedMessage id="portfolio.asset.payouts-from-neu.community-link" />
                  </ExternalLink>
                ),
              }}
            />
          }
          textPosition={ECustomTooltipTextPosition.LEFT}
          preventDefault={false}
        />
      </Heading>

      <PanelRounded className={styles.tableContainer}>{children}</PanelRounded>
    </Container>
  </>
);

const AssetPortfolioLayout: React.FunctionComponent<ILayoutProps & IDispatchToProps> = ({
  tokensDisbursal,
  isVerifiedInvestor,
  redistributePayout,
  acceptPayout,
  acceptCombinedPayout,
  tokensDisbursalEurEquivTotal,
  tokensDisbursalEurEquivTotalDisbursed,
}) => (
  <Table
    columns={prepareTableColumns(
      tokensDisbursalEurEquivTotal,
      tokensDisbursalEurEquivTotalDisbursed,
      isVerifiedInvestor,
      acceptCombinedPayout,
      tokensDisbursal,
    )}
    data={prepareTableRowData(
      tokensDisbursal,
      isVerifiedInvestor,
      redistributePayout,
      acceptPayout,
    )}
    withFooter={true}
  />
);

const AssetPortfolio = compose<ILayoutProps & IDispatchToProps, IExternalProps>(
  appConnect<{}, IDispatchToProps>({
    dispatchToProps: dispatch => ({
      redistributePayout: (tokenDisbursal: ITokenDisbursal) =>
        dispatch(actions.txTransactions.startInvestorPayoutRedistribute(tokenDisbursal)),
      acceptPayout: (tokenDisbursal: ITokenDisbursal) =>
        dispatch(actions.txTransactions.startInvestorPayoutAccept([tokenDisbursal])),
      acceptCombinedPayout: (tokensDisbursal: ReadonlyArray<ITokenDisbursal>) =>
        dispatch(actions.txTransactions.startInvestorPayoutAccept(tokensDisbursal)),
    }),
  }),
  withContainer(AssetPortfolioLayoutContainer),

  // Loading
  branch<IExternalProps>(
    ({ tokenDisbursalIsLoading }) => tokenDisbursalIsLoading,
    renderComponent(() => <LoadingIndicator className="m-auto" />),
  ),
  // Error
  branch<IExternalProps>(
    ({ tokenDisbursalError }) => tokenDisbursalError,
    renderComponent(() => (
      <WarningAlert data-test-id="my-neu-widget-error" className="m-auto">
        <FormattedMessage id="common.error" values={{ separator: " " }} />
      </WarningAlert>
    )),
  ),
  // No payouts
  branch<ILayoutProps>(
    ({ tokensDisbursal }) => !tokensDisbursal || (tokensDisbursal && tokensDisbursal.length === 0),
    renderComponent(AssetPortfolioLayoutNoPayouts),
  ),
)(AssetPortfolioLayout);

export { AssetPortfolio };
