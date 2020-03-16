import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { selectEtoOnChainNextStateStartDate } from "../../../../../modules/eto/selectors";
import {
  EETOStateOnChain,
  TEtoWithCompanyAndContractReadonly,
} from "../../../../../modules/eto/types";
import { appConnect } from "../../../../../store";
import { FormatNumber } from "../../../../shared/formatters/FormatNumber";
import { Money } from "../../../../shared/formatters/Money";
import { InvestmentProgress } from "../../../shared/InvestmentProgress";

import * as styles from "./InvestmentStatus.module.scss";

export interface IInvestmentWidgetProps {
  eto: TEtoWithCompanyAndContractReadonly;
}

export interface IInvestmentWidgetStateProps {
  nextStateDate: Date | undefined;
}

export type TInvestWidgetProps = IInvestmentWidgetProps & IInvestmentWidgetStateProps;

const InvestmentLayout: React.FunctionComponent<TInvestWidgetProps> = ({ eto }) => {
  const totalInvestors = eto.contract!.totalInvestment.totalInvestors;

  return (
    <div className={styles.investmentWidget}>
      <div className={styles.header}>
        {eto.contract!.timedState !== EETOStateOnChain.Payout && (
          <div>
            {"≈"}
            <Money
              value={eto.contract!.totalInvestment.totalEquivEurUlps}
              inputFormat={ENumberInputFormat.ULPS}
              valueType={ECurrency.EUR}
              outputFormat={ENumberOutputFormat.FULL}
            />
          </div>
        )}
        {process.env.NF_MAY_SHOW_INVESTOR_STATS === "1" && (
          <div data-test-id={`eto-overview-${eto.etoId}-investors-count`}>
            <FormattedMessage
              id="shared-component.eto-overview.investors"
              values={{
                totalInvestors,
                totalInvestorsAsString: (
                  <FormatNumber
                    value={totalInvestors}
                    outputFormat={ENumberOutputFormat.INTEGER}
                    inputFormat={ENumberInputFormat.FLOAT}
                  />
                ),
              }}
            />
          </div>
        )}
      </div>
      <InvestmentProgress eto={eto} />
    </div>
  );
};

const InvestmentStatus = compose<TInvestWidgetProps, IInvestmentWidgetProps>(
  appConnect<IInvestmentWidgetStateProps, {}, IInvestmentWidgetProps>({
    stateToProps: (state, props) => ({
      nextStateDate: selectEtoOnChainNextStateStartDate(state, props.eto.previewCode),
    }),
  }),
)(InvestmentLayout);

export { InvestmentStatus, InvestmentLayout };
