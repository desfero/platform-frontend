import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Container, Row } from "reactstrap";

import { MONEY_DECIMALS } from "../../../../config/constants";
import { actions } from "../../../../modules/actions";
import {
  selectEthValueUlps,
  selectEurValueUlps,
  selectInvestmentGasCostEth,
} from "../../../../modules/investmentFlow/selectors";
import {
  selectEquityTokenCountByEtoId,
  selectEtoWithCompanyAndContractById,
  selectNeuRewardUlpsByEtoId,
} from "../../../../modules/public-etos/selectors";
import { selectEtherPriceEur } from "../../../../modules/shared/tokenPrice/selectors";
import { appConnect } from "../../../../store";
import {
  addBigNumbers,
  divideBigNumbers,
  multiplyBigNumbers,
} from "../../../../utils/BigNumberUtils";
import { IIntlProps, injectIntlHelpers } from "../../../../utils/injectIntlHelpers";
import { formatMoney } from "../../../../utils/Money.utils";
import { Button } from "../../../shared/buttons";
import { DocumentLink } from "../../../shared/DocumentLink";
import { Heading } from "../../../shared/modals/Heading";
import { InfoList } from "../shared/InfoList";
import { InfoRow } from "../shared/InfoRow";
import { ITxSummaryDispatchProps } from "../TxSender";

import * as neuIcon from "../../../../assets/img/neu_icon.svg";
import * as tokenIcon from "../../../../assets/img/token_icon.svg";
import * as styles from "./Summary.module.scss";

interface IStateProps {
  companyName: string;
  etoAddress: string;
  investmentEur: string;
  investmentEth: string;
  gasCostEth: string;
  equityTokens: string;
  estimatedReward: string;
  etherPriceEur: string;
  agreementUrl: string;
}

type IProps = IStateProps & ITxSummaryDispatchProps;

function formatEur(val?: string): string | undefined {
  return val && formatMoney(val, MONEY_DECIMALS, 0);
}

function formatEth(val?: string): string | undefined {
  return val && formatMoney(val, MONEY_DECIMALS, 4);
}

export const InvestmentSummaryComponent = injectIntlHelpers(
  ({ agreementUrl, onAccept, gasCostEth, etherPriceEur, ...data }: IProps & IIntlProps) => {
    const equityTokens = (
      <span>
        <img src={tokenIcon} /> {data.equityTokens}
      </span>
    );
    const estimatedReward = (
      <span>
        <img src={neuIcon} /> {formatEur(data.estimatedReward)} NEU
      </span>
    );
    const investment = `€ ${formatEur(data.investmentEur)} ≈ ${formatEth(data.investmentEth)} ETH`;

    const gasCostEuro = multiplyBigNumbers([gasCostEth, etherPriceEur]);
    const totalCostEth = addBigNumbers([gasCostEth, data.investmentEth]);
    const totalCostEur = addBigNumbers([gasCostEuro, data.investmentEur]);

    const total = `€ ${formatEur(totalCostEur)} ≈ ${formatEth(totalCostEth)} ETH`;
    const tokenPrice = divideBigNumbers(data.investmentEur, data.equityTokens);

    return (
      <Container className={styles.container}>
        <Row className="mt-0">
          <Heading>
            <FormattedMessage id="investment-flow.investment-summary" />
          </Heading>
        </Row>

        <Row>
          <InfoList>
            <InfoRow
              caption={<FormattedMessage id="investment-flow.summary.company" />}
              value={data.companyName}
            />
            <InfoRow
              caption={<FormattedMessage id="investment-flow.summary.token-price" />}
              value={`${formatMoney(tokenPrice, MONEY_DECIMALS, 2)} €`}
            />
            <InfoRow
              caption={<FormattedMessage id="investment-flow.summary.eto-address" />}
              value={data.etoAddress}
            />
            <InfoRow
              caption={<FormattedMessage id="investment-flow.summary.your-investment" />}
              value={investment}
            />
            <InfoRow
              caption={<FormattedMessage id="investment-flow.summary.transaction-cost" />}
              value={`${formatEth(gasCostEth)} ETH`}
            />
            <InfoRow
              caption={<FormattedMessage id="investment-flow.summary.equity-tokens" />}
              value={equityTokens}
            />
            <InfoRow
              caption={<FormattedMessage id="investment-flow.summary.estimated-reward" />}
              value={estimatedReward}
            />
            <InfoRow
              caption={<FormattedMessage id="investment-flow.summary.transaction-value" />}
              value={total}
            />
          </InfoList>
        </Row>

        <Row className="justify-content-center">
          <DocumentLink
            url={agreementUrl}
            name={<FormattedMessage id="investment-flow.summary.download-agreement" />}
          />
        </Row>

        <Row className="justify-content-center mb-0 mt-0">
          <Button layout="primary" type="button" onClick={onAccept}>
            <FormattedMessage id="investment-flow.confirm" />
          </Button>
        </Row>
      </Container>
    );
  },
);

export const InvestmentSummary = appConnect<IStateProps, ITxSummaryDispatchProps>({
  stateToProps: state => {
    const i = state.investmentFlow;
    const p = state.publicEtos;

    // eto and computed values are guaranteed to be present at investment summary state
    const eto = selectEtoWithCompanyAndContractById(state, i.etoId)!;
    return {
      agreementUrl: "fufu",
      companyName: eto.company.name,
      etoAddress: eto.etoId,
      investmentEth: selectEthValueUlps(i),
      investmentEur: selectEurValueUlps(i),
      gasCostEth: selectInvestmentGasCostEth(i),
      equityTokens: selectEquityTokenCountByEtoId(p, i.etoId) as string,
      estimatedReward: selectNeuRewardUlpsByEtoId(p, i.etoId) as string,
      etherPriceEur: selectEtherPriceEur(state.tokenPrice),
    };
  },
  dispatchToProps: d => ({
    onAccept: () => d(actions.txSender.txSenderAccept()),
  }),
})(InvestmentSummaryComponent);
