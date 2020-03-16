import {
  divideBigNumbers,
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "@neufund/shared";
import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose, withProps } from "recompose";

import { selectEtoOnChainStateById } from "../../../../modules/eto/selectors";
import {
  EETOStateOnChain,
  TEtoWithCompanyAndContractReadonly,
} from "../../../../modules/eto/types";
import { selectEtherPriceEur } from "../../../../modules/shared/tokenPrice/selectors";
import { appConnect } from "../../../../store";
import { FormatNumber } from "../../../shared/formatters/FormatNumber";
import { Money } from "../../../shared/formatters/Money";
import { InvestmentProgress } from "../../shared/InvestmentProgress";
import { CounterWidget } from "./CounterWidget";
import { SuccessMessage } from "./Message";

import * as styles from "./EtoMaxCapExceeded.module.scss";

export interface IExternalProps {
  eto: TEtoWithCompanyAndContractReadonly;
}

interface IStateProps {
  etherPriceEur: string;
  isPreEto: boolean;
}

interface IWithProps {
  isWaitingForNextStateToStart: boolean;
  nextStateStartDate: Date;
}

const EtoMaxCapExceededComponent: React.FunctionComponent<IExternalProps &
  IStateProps &
  IWithProps> = ({
  eto,
  etherPriceEur,
  isPreEto,
  isWaitingForNextStateToStart,
  nextStateStartDate,
}) =>
  isPreEto && isWaitingForNextStateToStart ? (
    <div className={styles.maxCapExceeded}>
      <CounterWidget
        endDate={nextStateStartDate}
        awaitedState={EETOStateOnChain.Public}
        etoId={eto.etoId}
        alternativeText={
          <FormattedMessage id="shared-component.eto-overview.pre-eto.max-cap-reached" />
        }
      />
    </div>
  ) : (
    <div className={styles.maxCapExceeded}>
      <div className={cn(styles.header, styles.center)}>
        <div>
          <SuccessMessage title={<FormattedMessage id="shared-component.eto-overview.success" />} />
        </div>
      </div>
      <div className={styles.header}>
        <div>
          <Money
            value={divideBigNumbers(eto.contract!.totalInvestment.totalEquivEurUlps, etherPriceEur)}
            inputFormat={ENumberInputFormat.ULPS}
            valueType={ECurrency.ETH}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          />
        </div>
        <div>
          <FormattedMessage
            id="shared-component.eto-overview.investors"
            values={{
              totalInvestors: eto.contract!.totalInvestment.totalInvestors,
              totalInvestorsAsString: (
                <FormatNumber
                  value={eto.contract!.totalInvestment.totalInvestors}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  inputFormat={ENumberInputFormat.FLOAT}
                />
              ),
            }}
          />
        </div>
      </div>
      <div className={styles.header}>
        <div>
          <Money
            value={eto.contract!.totalInvestment.totalTokensInt}
            inputFormat={ENumberInputFormat.FLOAT}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
            valueType={ECurrency.EUR_TOKEN}
          />
        </div>
        <div className={cn(styles.capReached, "text-uppercase")}>
          <FormattedMessage id="shared-component.eto-overview.max-cap-reached" />
        </div>
      </div>
      <InvestmentProgress eto={eto} />
    </div>
  );

const EtoMaxCapExceededWidget = compose<IExternalProps & IStateProps & IWithProps, IExternalProps>(
  appConnect<IStateProps, {}, IExternalProps>({
    stateToProps: (state, props) => ({
      etherPriceEur: selectEtherPriceEur(state),
      isPreEto: selectEtoOnChainStateById(state, props.eto.etoId) === EETOStateOnChain.Whitelist,
    }),
  }),
  withProps<IWithProps, IStateProps & IExternalProps>(({ eto }) => {
    const publicStartDate = eto.contract!.startOfStates[EETOStateOnChain.Public];

    return {
      isWaitingForNextStateToStart: !!publicStartDate && publicStartDate > new Date(),
      nextStateStartDate: publicStartDate!,
    };
  }),
)(EtoMaxCapExceededComponent);

export { EtoMaxCapExceededWidget, EtoMaxCapExceededComponent };
