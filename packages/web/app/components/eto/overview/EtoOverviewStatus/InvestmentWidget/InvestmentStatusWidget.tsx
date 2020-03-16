import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { EEtoState } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { InvalidETOStateError } from "../../../../../modules/eto/errors";
import { TEtoWithCompanyAndContractReadonly } from "../../../../../modules/eto/types";
import { isOnChain } from "../../../../../modules/eto/utils";
import { FormatNumber } from "../../../../shared/formatters/FormatNumber";
import { Money } from "../../../../shared/formatters/Money";
import { InvestmentProgress } from "../../../shared/InvestmentProgress";
import { InvestmentProgressPercentage } from "../../InvestmentProgressPercentage";
import { InvestmentTarget } from "./InvestmentTarget";

import * as styles from "./InvestmentStatusWidget.module.scss";

enum EInvestmentStatusSize {
  NORMAL = styles.statsWrapperNormal,
  SMALL = styles.statsWrapperSmall,
}

interface IInvestmentStatsProps {
  eto: TEtoWithCompanyAndContractReadonly;
  size?: EInvestmentStatusSize;
}

const InvestmentStatusWidget: React.FunctionComponent<IInvestmentStatsProps> = ({
  eto,
  size = EInvestmentStatusSize.NORMAL,
}) => {
  if (!isOnChain(eto)) {
    throw new InvalidETOStateError(eto.state, EEtoState.ON_CHAIN);
  }

  const totalInvestors = eto.contract.totalInvestment.totalInvestors;
  return (
    <section className={cn(size)}>
      <div className={styles.row}>
        <span className={styles.funded}>
          <InvestmentProgressPercentage eto={eto} />
        </span>
        <span>
          <FormattedMessage
            id="shared-component.eto-overview.investment-stats.total-investors"
            values={{
              totalInvestors: (
                <FormatNumber
                  data-test-id="investment-widget-investors-invested"
                  value={totalInvestors}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  inputFormat={ENumberInputFormat.FLOAT}
                />
              ),
            }}
          />
        </span>
      </div>
      <InvestmentProgress eto={eto} />
      <div className={styles.row}>
        <span>
          <FormattedMessage
            id="shared-component.eto-overview.investment-stats.total-amount-raised"
            values={{
              amountRaised: (
                <Money
                  data-test-id="investment-widget-total-nEur-invested"
                  value={eto.contract.totalInvestment.totalEquivEurUlps}
                  inputFormat={ENumberInputFormat.ULPS}
                  valueType={ECurrency.EUR}
                  outputFormat={ENumberOutputFormat.FULL}
                />
              ),
            }}
          />
        </span>
        <InvestmentTarget eto={eto} />
      </div>
    </section>
  );
};

export { InvestmentStatusWidget, EInvestmentStatusSize };
