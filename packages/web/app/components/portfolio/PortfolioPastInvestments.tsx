import { Button, EButtonLayout, Neu, Table, TokenDetails } from "@neufund/design-system";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  EPriceFormat,
  nonNullable,
  withContainer,
} from "@neufund/shared";
import * as React from "react";
import { FormattedDate } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { actions } from "../../modules/actions";
import { TETOWithInvestorTicket } from "../../modules/investor-portfolio/types";
import { getTokenPrice } from "../../modules/investor-portfolio/utils";
import { appConnect } from "../../store";
import { etoPublicViewLink } from "../appRouteUtils";
import { Container } from "../layouts/Container";
import { FormatNumber } from "../shared/formatters/FormatNumber";
import { Money } from "../shared/formatters/Money";
import { Heading } from "../shared/Heading";
import { LoadingIndicator } from "../shared/loading-indicator/LoadingIndicator";
import { PanelRounded } from "../shared/Panel";
import { Tooltip } from "../shared/tooltips/Tooltip";
import { ECustomTooltipTextPosition } from "../shared/tooltips/TooltipBase";
import { WarningAlert } from "../shared/WarningAlert";

import * as styles from "./PortfolioLayout.module.scss";

interface IExternalProps {
  pastInvestments: TETOWithInvestorTicket[];
  isRetailEto: boolean;
  hasError: boolean;
}

type TDispatchProps = {
  showDownloadAgreementModal: (etoId: string, isRetailEto: boolean) => void;
};

type TComponentProps = IExternalProps & TDispatchProps;

const tableColumns = [
  {
    Header: <FormattedMessage id="portfolio.section.past-investments.table.header.token" />,
    accessor: "tokenInfo",
  },
  {
    Header: <FormattedMessage id="portfolio.section.past-investments.table.header.quantity" />,
    accessor: "quantity",
  },
  {
    Header: <FormattedMessage id="portfolio.section.past-investments.table.header.price-eur" />,
    accessor: "price",
  },
  {
    Header: <FormattedMessage id="portfolio.section.past-investments.table.header.value-eur" />,
    accessor: "value",
  },
  {
    Header: <FormattedMessage id="portfolio.section.past-investments.table.header.neu-reward" />,
    accessor: "reward",
  },
  {
    Header: "",
    accessor: "actions",
  },
];

const prepareTableRowData = (
  pastInvestments: TETOWithInvestorTicket[],
  showDownloadAgreementModal: (etoId: string, isRetailEto: boolean) => void,
  isRetailEto: boolean,
) =>
  pastInvestments.map(
    ({ previewCode, product, contract, company, etoId, equityTokenImage, investorTicket }) => {
      const contractData = nonNullable(contract);
      const timedState = contractData.timedState;
      const investmentDate = nonNullable(contractData.startOfStates[timedState]);

      return {
        tokenInfo: (
          <TokenDetails
            etoLink={etoPublicViewLink(previewCode, product.jurisdiction)}
            equityTokenName={company.brandName}
            equityTokenImage={equityTokenImage}
            data-test-id={`past-investments-${etoId}`}
          >
            <FormattedDate day="2-digit" year="numeric" month="short" value={investmentDate} />
          </TokenDetails>
        ),
        quantity: (
          <FormatNumber
            value={investorTicket.equityTokenInt}
            inputFormat={ENumberInputFormat.FLOAT}
            outputFormat={ENumberOutputFormat.INTEGER}
          />
        ),
        value: (
          <Money
            value={investorTicket.equivEurUlps}
            inputFormat={ENumberInputFormat.ULPS}
            valueType={ECurrency.EUR}
            outputFormat={ENumberOutputFormat.FULL}
            data-test-id="past-investments-invested-amount"
          />
        ),
        price: (
          <Money
            value={getTokenPrice(investorTicket.equityTokenInt, investorTicket.equivEurUlps)}
            inputFormat={ENumberInputFormat.FLOAT}
            valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
            outputFormat={ENumberOutputFormat.FULL}
            data-test-id="past-investments-token-price"
          />
        ),
        reward: (
          <Neu
            value={investorTicket.rewardNmkUlps.toString()}
            outputFormat={ENumberOutputFormat.FULL}
            data-test-id="past-investments-asset-neu-reward"
          />
        ),
        actions: (
          <Button
            onClick={() => showDownloadAgreementModal(etoId, isRetailEto)}
            layout={EButtonLayout.OUTLINE}
            data-test-id={`modals.portfolio.portfolio-past-investments.download-agreements-${etoId}`}
            className="mr-3"
          >
            <FormattedMessage id="portfolio.section.my-assets.download-agreements" />
          </Button>
        ),
      };
    },
  );

const PastInvestmentsContainer: React.FunctionComponent = ({ children }) => (
  <>
    <Container className={styles.container}>
      <Heading level={4} decorator={false}>
        <FormattedMessage id="portfolio.section.past-investments.title" />
        <Tooltip
          content={<FormattedMessage id="portfolio.section.past-investments.tooltip" />}
          textPosition={ECustomTooltipTextPosition.LEFT}
        />
      </Heading>

      <PanelRounded className={styles.tableContainer}>{children}</PanelRounded>
    </Container>
  </>
);

const PastInvestmentsNoInvestments: React.FunctionComponent = () => (
  <p className="m-auto">
    <FormattedMessage id="portfolio.section.past-investments.no-investments" />
  </p>
);

const PortfolioPastInvestmentsLayout: React.FunctionComponent<TComponentProps> = ({
  pastInvestments,
  showDownloadAgreementModal,
  isRetailEto,
}) => (
  <Table
    columns={tableColumns}
    data={prepareTableRowData(pastInvestments, showDownloadAgreementModal, isRetailEto)}
  />
);

const PortfolioPastInvestments = compose<TComponentProps, IExternalProps>(
  appConnect<{}, TDispatchProps, {}>({
    dispatchToProps: dispatch => ({
      showDownloadAgreementModal: (etoId: string, isRetailEto: boolean) => {
        dispatch(actions.portfolio.showDownloadAgreementModal(etoId, isRetailEto));
      },
    }),
  }),
  withContainer(PastInvestmentsContainer),
  // Loading
  branch<IExternalProps>(
    ({ pastInvestments }) => pastInvestments === undefined,
    renderComponent(() => <LoadingIndicator className="m-auto" />),
  ),
  // Error
  branch<IExternalProps>(
    ({ hasError }) => hasError,
    renderComponent(() => (
      <WarningAlert data-test-id="my-neu-widget-error" className="m-auto">
        <FormattedMessage id="common.error" values={{ separator: " " }} />
      </WarningAlert>
    )),
  ),
  // No assets
  branch<IExternalProps>(
    ({ pastInvestments }) => pastInvestments.length === 0,
    renderComponent(PastInvestmentsNoInvestments),
  ),
)(PortfolioPastInvestmentsLayout);

export {
  PortfolioPastInvestments,
  PastInvestmentsContainer,
  PortfolioPastInvestmentsLayout,
  PastInvestmentsNoInvestments,
};
