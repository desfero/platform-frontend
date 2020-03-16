import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";

import { toFixedPrecisionGasCostEth } from "../../../../../modules/tx/user-flow/transfer/utils";
import {
  ESize,
  ETextPosition,
  ETheme,
  MoneySuiteWidget,
  StaticMoneyWidget,
} from "../../../../shared/MoneySuiteWidget/MoneySuiteWidget";

import ethIcon from "../../../../../assets/img/eth_icon.svg";

export const TransactionFeeWidget: React.FunctionComponent<{ cost: string; costEur: string }> = ({
  cost,
  costEur,
}) =>
  cost === toFixedPrecisionGasCostEth("0") ? (
    <StaticMoneyWidget
      icon={ethIcon}
      upperText="< 0.0001 ETH"
      lowerText="< 0.0001 EUR"
      theme={ETheme.BLACK}
      size={ESize.MEDIUM}
      data-test-id="modals.tx-sender.withdraw-flow.summary.cost"
      textPosition={ETextPosition.RIGHT}
    />
  ) : (
    <MoneySuiteWidget
      currency={ECurrency.ETH}
      largeNumber={cost}
      value={costEur}
      currencyTotal={ECurrency.EUR}
      inputFormat={ENumberInputFormat.FLOAT}
      data-test-id="modals.tx-sender.withdraw-flow.summary.cost"
      theme={ETheme.BLACK}
      size={ESize.MEDIUM}
      textPosition={ETextPosition.RIGHT}
      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
      icon={ethIcon}
      useTildeSign={true}
    />
  );
