import {
  divideBigNumbers,
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  multiplyBigNumbers,
} from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose, withProps } from "recompose";

import { EEtoState } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { InvalidETOStateError } from "../../modules/eto/errors";
import { TEtoWithCompanyAndContractReadonly } from "../../modules/eto/types";
import { isOnChain } from "../../modules/eto/utils";
import { selectEtherPriceEur } from "../../modules/shared/tokenPrice/selectors";
import { appConnect } from "../../store";
import { DashboardWidget } from "../shared/dashboard-widget/DashboardWidget";
import { Money } from "../shared/formatters/Money";
import { IPanelProps } from "../shared/Panel";

import * as styles from "./ETOFundraisingStatistics.module.scss";

interface IExternalProps {
  eto: TEtoWithCompanyAndContractReadonly;
}

interface IStateProps {
  etherPriceEur: string;
}

interface IWithProps {
  etherTokenEurEquivUlps: string;
  averageInvestmentEurUlps: string;
}

type IProps = IExternalProps & IPanelProps & IWithProps;

const ETOFundraisingStatisticsLayout: React.ComponentType<IProps> = ({
  eto,
  columnSpan,
  etherTokenEurEquivUlps,
  averageInvestmentEurUlps,
}) => {
  if (!isOnChain(eto)) {
    throw new InvalidETOStateError(eto.state, EEtoState.ON_CHAIN);
  }

  const {
    totalEquivEurUlps,
    etherTokenBalance,
    euroTokenBalance,
    totalInvestors,
  } = eto.contract.totalInvestment;

  return (
    <DashboardWidget
      data-test-id="settings.fundraising-statistics"
      title={<FormattedMessage id="settings.fundraising-statistics.title" />}
      columnSpan={columnSpan}
    >
      <section className={styles.groupWrapper}>
        <span className={styles.label}>
          <FormattedMessage id="settings.fundraising-statistics.total-investment" />
        </span>
        <Money
          value={totalEquivEurUlps}
          valueType={ECurrency.EUR}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
        />
        <span className={styles.label}>
          <FormattedMessage id="settings.fundraising-statistics.eth-investment" />
        </span>
        <span>
          <Money
            value={etherTokenBalance}
            valueType={ECurrency.ETH}
            inputFormat={ENumberInputFormat.ULPS}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          />
          {" ≈ "}
          <Money
            value={etherTokenEurEquivUlps}
            valueType={ECurrency.EUR}
            inputFormat={ENumberInputFormat.ULPS}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          />
        </span>
        <span className={styles.label}>
          <FormattedMessage id="settings.fundraising-statistics.neur-investment" />
        </span>
        <Money
          value={euroTokenBalance}
          valueType={ECurrency.EUR_TOKEN}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
        />
        <span className={styles.label}>
          <FormattedMessage id="settings.fundraising-statistics.average-investment-value" />
        </span>
        <Money
          value={averageInvestmentEurUlps}
          valueType={ECurrency.EUR}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
        />
        <span className={styles.label}>
          <FormattedMessage id="settings.fundraising-statistics.total-investors" />
        </span>
        <span>{totalInvestors}</span>
      </section>
      {/*  TODO: Add CSV download */}
    </DashboardWidget>
  );
};

const ETOFundraisingStatistics = compose<IProps, IExternalProps & IPanelProps>(
  appConnect<IStateProps, {}>({
    stateToProps: state => ({
      etherPriceEur: selectEtherPriceEur(state),
    }),
  }),
  withProps<IWithProps, IProps & IStateProps>(props => {
    if (!isOnChain(props.eto)) {
      throw new InvalidETOStateError(props.eto.state, EEtoState.ON_CHAIN);
    }

    return {
      etherTokenEurEquivUlps: multiplyBigNumbers([
        props.eto.contract.totalInvestment.etherTokenBalance,
        props.etherPriceEur,
      ]),
      averageInvestmentEurUlps: divideBigNumbers(
        props.eto.contract.totalInvestment.totalEquivEurUlps,
        props.eto.contract.totalInvestment.totalInvestors,
      ),
    };
  }),
)(ETOFundraisingStatisticsLayout);

export { ETOFundraisingStatistics, ETOFundraisingStatisticsLayout };
