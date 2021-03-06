import { ButtonInline } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETheme, Money } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../shared/formatters/utils";
import { InlineIcon } from "../../../shared/icons/InlineIcon";

import infoIcon from "../../../../assets/img/inline_icons/info.svg";
import * as styles from "./MyNeuWidget.module.scss";

type TAvailablePayoutProps = {
  tokensDisbursalEurEquiv: string | undefined;
  goToPortfolio: () => void;
};

export const MyNeuWidgetAvailablePayout: React.FunctionComponent<TAvailablePayoutProps> = ({
  tokensDisbursalEurEquiv,
  goToPortfolio,
}) => (
  <section className={styles.payoutContainer} data-test-id="my-neu-widget-payout-available">
    <InlineIcon svgIcon={infoIcon} className={styles.warningIcon} />
    <div>
      <FormattedMessage
        id="dashboard.my-neu-widget.available-payout"
        values={{
          amount: (
            <Money
              value={tokensDisbursalEurEquiv}
              inputFormat={ENumberInputFormat.ULPS}
              valueType={ECurrency.EUR}
              outputFormat={ENumberOutputFormat.FULL}
              theme={ETheme.GREEN}
              className={styles.payoutAmount}
            />
          ),
        }}
      />
      <ButtonInline onClick={goToPortfolio} className={styles.buttonPayout}>
        <FormattedMessage id="dashboard.my-neu-widget.available-payout-claim" />
      </ButtonInline>
    </div>
  </section>
);
