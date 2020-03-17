import { Button, EButtonLayout, Table, TokenDetails, Eur } from "@neufund/design-system";
import {
  ENumberInputFormat,
  ENumberOutputFormat,
  EPriceFormat,
  multiplyBigNumbers,
  withContainer,
} from "@neufund/shared";
import BigNumber from "bignumber.js";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { actions } from "../../modules/actions";
import { selectEtosError } from "../../modules/eto/selectors";
import {
  selectMyAssetsEurEquivTotalWithNeu,
  selectMyAssetsWithTokenData,
} from "../../modules/investor-portfolio/selectors";
import { TETOWithTokenData } from "../../modules/investor-portfolio/types";
import { selectNeuPriceEur } from "../../modules/shared/tokenPrice/selectors";
import {
  selectNeuBalance,
  selectNeuBalanceEurEquiv,
  selectNeumarkAddress,
} from "../../modules/wallet/selectors";
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

import neuIcon from "../../assets/img/neu_icon.svg";
import * as styles from "./PortfolioLayout.module.scss";

interface IExternalProps {
  isRetailEto: boolean;
  walletAddress: string;
}

interface IStateProps {
  neumarkAddress: string;
  myNeuBalance: string;
  neuPrice: string;
  neuValue: string;
  myAssets: TETOWithTokenData[];
  hasError: boolean;
  totalEurEquiv: string;
}

interface IDispatchProps {
  showDownloadAgreementModal: (etoId: string, isRetailEto: boolean) => void;
  startTokenTransfer: (tokenAddress: string, tokenImage: string) => void;
}

interface IAdditionalProps {
  tokenLoaded: boolean;
  setTokenLoaded: (value: boolean) => void;
}

type TComponentProps = IExternalProps & IStateProps & IDispatchProps & IAdditionalProps;

const prepareTableColumns = (totalEurEquiv: string) => [
  {
    Header: <FormattedMessage id="portfolio.section.my-assets.table.header.token" />,
    accessor: "tokenInfo",
    Footer: <FormattedMessage id="portfolio.section.my-assets.table.footer.totals" />,
  },
  {
    Header: <FormattedMessage id="portfolio.section.my-assets.table.header.quantity" />,
    accessor: "quantity",
  },
  {
    Header: <FormattedMessage id="portfolio.section.my-assets.table.header.current-price" />,
    accessor: "currentPrice",
  },
  {
    Header: <FormattedMessage id="portfolio.section.my-assets.table.header.current-value" />,
    accessor: "value",
    Footer: () => (
      <Eur
        value={totalEurEquiv}
        outputFormat={ENumberOutputFormat.FULL}
      />
    ),
  },
  { Header: "", accessor: "actions" },
];

const prepareTableRowData = (
  myNeuBalance: string,
  neuValue: string,
  neuPrice: string,
  startTokenTransfer: (tokenAddress: string, tokenImage: string) => void,
  neumarkAddress: string,
  myAssets: TETOWithTokenData[],
  showDownloadAgreementModal: (etoId: string, isRetailEto: boolean) => void,
  isRetailEto: boolean,
) => {
  const myNeu = new BigNumber(myNeuBalance).isZero()
    ? []
    : [
        {
          tokenInfo: (
            <TokenDetails
              equityTokenName="Neumark"
              equityTokenSymbol="NEU"
              equityTokenImage={neuIcon}
            />
          ),
          quantity: (
            <FormatNumber
              value={myNeuBalance}
              inputFormat={ENumberInputFormat.ULPS}
              outputFormat={ENumberOutputFormat.FULL}
            />
          ),
          value: (
            <Eur
              value={neuValue}
              outputFormat={ENumberOutputFormat.FULL}
            />
          ),
          currentPrice: (
            <Money
              value={neuPrice}
              inputFormat={ENumberInputFormat.FLOAT}
              valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
              outputFormat={ENumberOutputFormat.FULL}
            />
          ),
          actions: (
            <Button
              layout={EButtonLayout.PRIMARY}
              onClick={() => startTokenTransfer(neumarkAddress, neuIcon)}
              data-test-id="portfolio-my-assets-neu-agreements"
            >
              <FormattedMessage id="portfolio.section.my-assets.send" />
            </Button>
          ),
        },
      ];

  const assets = myAssets
    .filter(v => v.tokenData)
    .filter(v => !new BigNumber(v.tokenData.balance).isZero())
    .map(
      ({
        previewCode,
        product,
        equityTokenImage,
        equityTokenName,
        etoId,
        tokenData,
        equityTokenSymbol,
        contract,
      }) => ({
        tokenInfo: (
          <TokenDetails
            etoLink={etoPublicViewLink(previewCode, product.jurisdiction)}
            equityTokenName={equityTokenName}
            equityTokenSymbol={equityTokenSymbol}
            equityTokenImage={equityTokenImage}
            data-test-id={`portfolio-my-assets-token-${etoId}`}
          />
        ),

        quantity: (
          <span data-test-id={`portfolio-my-assets-token-balance-${etoId}`}>
            <FormatNumber
              value={tokenData.balance}
              inputFormat={ENumberInputFormat.FLOAT}
              outputFormat={ENumberOutputFormat.INTEGER}
            />
          </span>
        ),

        value: (
          <Eur
            value={multiplyBigNumbers([tokenData.tokenPrice, tokenData.balance])}
          />
        ),

        currentPrice: (
          <Money
            value={tokenData.tokenPrice}
            inputFormat={ENumberInputFormat.ULPS}
            valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
            outputFormat={ENumberOutputFormat.FULL}
          />
        ),
        actions: (
          <>
            <Button
              onClick={() => showDownloadAgreementModal(etoId, isRetailEto)}
              layout={EButtonLayout.OUTLINE}
              data-test-id={`modals.portfolio.portfolio-assets.download-agreements-${etoId}`}
              className="mr-3"
            >
              <FormattedMessage id="portfolio.section.my-assets.download-agreements" />
            </Button>
            <Button
              disabled={!tokenData.canTransferToken}
              data-test-id={`modals.portfolio.portfolio-assets.send-token-${etoId}`}
              className="text-center"
              onClick={() => startTokenTransfer(contract!.equityTokenAddress, equityTokenImage)}
              layout={EButtonLayout.PRIMARY}
            >
              <FormattedMessage id="portfolio.section.my-assets.send" />
            </Button>
          </>
        ),
      }),
    );

  return [...myNeu, ...assets];
};

const PortfolioMyAssetsLayoutContainer: React.FunctionComponent = ({ children }) => (
  <>
    <Container className={styles.container}>
      <Heading level={4} decorator={false}>
        <FormattedMessage id="portfolio.section.your-assets.title" />
        <Tooltip
          content={<FormattedMessage id="portfolio.section.your-assets.tooltip" />}
          textPosition={ECustomTooltipTextPosition.LEFT}
        />
      </Heading>

      <PanelRounded className={styles.tableContainer}>{children}</PanelRounded>
    </Container>
  </>
);

const PortfolioMyAssetsLayout: React.FunctionComponent<TComponentProps> = ({
  myNeuBalance,
  neumarkAddress,
  myAssets,
  startTokenTransfer,
  neuPrice,
  neuValue,
  showDownloadAgreementModal,
  isRetailEto,
  totalEurEquiv,
}) => (
  <Table
    columns={prepareTableColumns(totalEurEquiv)}
    data={prepareTableRowData(
      myNeuBalance,
      neuValue,
      neuPrice,
      startTokenTransfer,
      neumarkAddress,
      myAssets,
      showDownloadAgreementModal,
      isRetailEto,
    )}
    withFooter={true}
  />
);

const PortfolioMyAssetsNoAssets: React.FunctionComponent = () => (
  <p className="m-auto">
    <FormattedMessage id="portfolio.section.your-assets.no-assets" />
  </p>
);

const PortfolioMyAssets = compose<TComponentProps, IExternalProps>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      myNeuBalance: selectNeuBalance(state),
      neuPrice: selectNeuPriceEur(state),
      neumarkAddress: selectNeumarkAddress(state),
      neuValue: selectNeuBalanceEurEquiv(state),
      myAssets: selectMyAssetsWithTokenData(state)!,
      hasError: selectEtosError(state),
      totalEurEquiv: selectMyAssetsEurEquivTotalWithNeu(state),
    }),
    dispatchToProps: dispatch => ({
      startTokenTransfer: (tokenAddress: string, tokenImage: string) =>
        dispatch(actions.txTransactions.startTokenTransfer(tokenAddress, tokenImage)),
      showDownloadAgreementModal: (etoId: string, isRetailEto: boolean) => {
        dispatch(actions.portfolio.showDownloadAgreementModal(etoId, isRetailEto));
      },
    }),
  }),
  withContainer(PortfolioMyAssetsLayoutContainer),
  // Loading
  branch<IStateProps>(
    ({ myAssets }) => myAssets === undefined,
    renderComponent(() => <LoadingIndicator className="m-auto" />),
  ),
  // Error
  branch<IStateProps>(
    ({ hasError }) => hasError,
    renderComponent(() => (
      <WarningAlert data-test-id="my-neu-widget-error" className="m-auto">
        <FormattedMessage id="common.error" values={{ separator: " " }} />
      </WarningAlert>
    )),
  ),
  // No assets
  branch<IStateProps>(
    ({ myAssets, myNeuBalance }) => myAssets.length === 0 && myNeuBalance === "0",
    renderComponent(PortfolioMyAssetsNoAssets),
  ),
)(PortfolioMyAssetsLayout);

export {
  PortfolioMyAssets,
  PortfolioMyAssetsLayoutContainer,
  PortfolioMyAssetsLayout,
  PortfolioMyAssetsNoAssets,
};
