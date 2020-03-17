import { Neu, Table, TokenDetails } from "@neufund/design-system";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  EPriceFormat,
  withContainer,
} from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { isOnChain } from "../../modules/eto/utils";
import {
  selectMyPendingAssetsInvestedTotal,
  selectMyPendingAssetsRewardTotal,
} from "../../modules/investor-portfolio/selectors";
import { TETOWithInvestorTicket } from "../../modules/investor-portfolio/types";
import { getTokenPrice } from "../../modules/investor-portfolio/utils";
import { appConnect } from "../../store";
import { etoPublicViewLink } from "../appRouteUtils";
import { Container } from "../layouts/Container";
import { EProjectStatusSize, ETOInvestorState } from "../shared/eto-state/ETOState";
import { FormatNumber } from "../shared/formatters/FormatNumber";
import { Money } from "../shared/formatters/Money";
import { Heading } from "../shared/Heading";
import { LoadingIndicator } from "../shared/loading-indicator/LoadingIndicator";
import { PanelRounded } from "../shared/Panel";
import { Tooltip } from "../shared/tooltips/Tooltip";
import { ECustomTooltipTextPosition } from "../shared/tooltips/TooltipBase";
import { WarningAlert } from "../shared/WarningAlert";
import { PortfolioAssetAction } from "./PortfolioAssetAction";

import * as styles from "./PortfolioLayout.module.scss";

type TExternalProps = {
  pendingAssets: TETOWithInvestorTicket[];
  hasError: boolean;
};

type TStateProps = {
  pendingAssetsTotalInvested: string | undefined;
  pendingAssetsTotalReward: string | undefined;
};

type TComponentProps = TExternalProps & TStateProps;

const prepareTableColumns = (
  pendingAssetsTotalInvested: string | undefined,
  pendingAssetsTotalReward: string | undefined,
) => [
  {
    Header: <FormattedMessage id="portfolio.section.reserved-assets.table.header.token" />,
    accessor: "tokenInfo",
    Footer: <FormattedMessage id="portfolio.section.reserved-assets.table.footer.totals" />,
  },
  {
    Header: <FormattedMessage id="portfolio.section.reserved-assets.table.header.balance" />,
    accessor: "quantity",
  },
  {
    Header: <FormattedMessage id="portfolio.section.reserved-assets.table.header.price-eur" />,
    accessor: "price",
  },
  {
    Header: <FormattedMessage id="portfolio.section.reserved-assets.table.header.value-eur" />,
    accessor: "value",
    Footer: () => (
      <Money
        value={pendingAssetsTotalInvested}
        inputFormat={ENumberInputFormat.ULPS}
        valueType={ECurrency.EUR}
        outputFormat={ENumberOutputFormat.FULL}
        data-test-id="portfolio-reserved-assets-total-invested"
      />
    ),
  },
  {
    Header: <FormattedMessage id="portfolio.section.reserved-assets.table.header.neu-reward" />,
    accessor: "reward",
    Footer: () => (
      <Neu
        value={pendingAssetsTotalReward}
        outputFormat={ENumberOutputFormat.FULL}
        data-test-id="portfolio-reserved-assets-total-reward"
      />
    ),
  },
  { Header: "", accessor: "actions" },
];

const prepareTableRowData = (pendingAssets: TETOWithInvestorTicket[]) =>
  pendingAssets.map(({ investorTicket, ...eto }) => {
    if (!isOnChain(eto)) {
      throw new Error(`${eto.etoId} should be on chain`);
    }
    const timedState = eto.contract.timedState;

    return {
      tokenInfo: (
        <TokenDetails
          etoLink={etoPublicViewLink(eto.previewCode, eto.product.jurisdiction)}
          equityTokenName={eto.equityTokenName}
          equityTokenSymbol={eto.equityTokenSymbol}
          equityTokenImage={eto.equityTokenImage}
        >
          <ETOInvestorState eto={eto} size={EProjectStatusSize.SMALL} />
        </TokenDetails>
      ),
      value: (
        <Money
          value={investorTicket.equivEurUlps}
          inputFormat={ENumberInputFormat.ULPS}
          valueType={ECurrency.EUR}
          outputFormat={ENumberOutputFormat.FULL}
          data-test-id="portfolio-reserved-asset-invested-amount"
        />
      ),

      quantity: (
        <FormatNumber
          value={investorTicket.equityTokenInt}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={ENumberOutputFormat.INTEGER}
          data-test-id="portfolio-reserved-asset-token-balance"
        />
      ),
      price: (
        <Money
          value={getTokenPrice(investorTicket.equityTokenInt, investorTicket.equivEurUlps)}
          inputFormat={ENumberInputFormat.FLOAT}
          valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
          outputFormat={ENumberOutputFormat.FULL}
          data-test-id="portfolio-reserved-token-price"
        />
      ),
      reward: (
        <Neu
          value={investorTicket.rewardNmkUlps.toString()}
          outputFormat={ENumberOutputFormat.FULL}
          data-test-id="portfolio-reserved-asset-neu-reward"
        />
      ),
      actions: <PortfolioAssetAction state={timedState} etoId={eto.etoId} />,
    };
  });

const PortfolioReservedAssetsContainer: React.FunctionComponent = ({ children }) => (
  <>
    <Container className={styles.container}>
      <Heading level={4} decorator={false}>
        <FormattedMessage id="portfolio.section.reserved-assets.title" />
        <Tooltip
          content={<FormattedMessage id="portfolio.section.reserved-assets.tooltip" />}
          textPosition={ECustomTooltipTextPosition.LEFT}
        />
      </Heading>

      <PanelRounded className={styles.tableContainer}>{children}</PanelRounded>
    </Container>
  </>
);

const PortfolioReservedAssetsNoAssets: React.FunctionComponent = () => (
  <p className="m-auto">
    <FormattedMessage id="portfolio.section.reserved-assets.no-assets" />
  </p>
);

const PortfolioReservedAssetsLayout: React.FunctionComponent<TComponentProps> = ({
  pendingAssets,
  pendingAssetsTotalInvested,
  pendingAssetsTotalReward,
}) => (
  <Table
    columns={prepareTableColumns(pendingAssetsTotalInvested, pendingAssetsTotalReward)}
    data={prepareTableRowData(pendingAssets)}
    withFooter={true}
  />
);

const PortfolioReservedAssets = compose<TComponentProps, TExternalProps>(
  appConnect<TStateProps, {}, {}>({
    stateToProps: state => ({
      pendingAssetsTotalInvested: selectMyPendingAssetsInvestedTotal(state),
      pendingAssetsTotalReward: selectMyPendingAssetsRewardTotal(state),
    }),
  }),
  withContainer(PortfolioReservedAssetsContainer),
  // Loading
  branch<TExternalProps>(
    ({ pendingAssets }) => pendingAssets === undefined,
    renderComponent(() => <LoadingIndicator className="m-auto" />),
  ),
  // Error
  branch<TExternalProps>(
    ({ hasError }) => hasError,
    renderComponent(() => (
      <WarningAlert data-test-id="my-neu-widget-error" className="m-auto">
        <FormattedMessage id="common.error" values={{ separator: " " }} />
      </WarningAlert>
    )),
  ),
  // No assets
  branch<TExternalProps>(
    ({ pendingAssets }) => pendingAssets.length === 0,
    renderComponent(PortfolioReservedAssetsNoAssets),
  ),
)(PortfolioReservedAssetsLayout);

export {
  PortfolioReservedAssets,
  PortfolioReservedAssetsContainer,
  PortfolioReservedAssetsLayout,
  PortfolioReservedAssetsNoAssets,
};
