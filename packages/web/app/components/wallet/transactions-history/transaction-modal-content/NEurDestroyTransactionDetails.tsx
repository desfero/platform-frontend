import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETransactionType, TExtractTxHistoryFromType } from "../../../../modules/tx-history/types";
import { DataRow, DataRowSeparator } from "../../../shared/DataRow";
import { ECurrency } from "../../../shared/formatters/utils";
import { getIconForCurrency } from "../../../shared/icons/CurrencyIcon";
import { EtherscanAddressLink } from "../../../shared/links/EtherscanLink";
import {
  ESize,
  ETextPosition,
  ETheme,
  MoneySuiteWidget,
} from "../../../shared/MoneySuiteWidget/MoneySuiteWidget";
import { BasicTransactionDetails } from "./BasicTransactionDetails";

interface IExternalProps {
  transaction: TExtractTxHistoryFromType<ETransactionType.NEUR_DESTROY>;
}

const NEurDestroyTransactionDetails: React.FunctionComponent<IExternalProps> = ({
  transaction,
}) => (
  <>
    <BasicTransactionDetails date={transaction.date} />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.neur-destroy.liquidated-by.caption" />}
      value={
        <EtherscanAddressLink address={transaction.liquidatedByAddress}>
          <FormattedMessage id="wallet.tx-list.modal.neur-destroy.liquidated-by.value" />
        </EtherscanAddressLink>
      }
    />

    <DataRowSeparator />

    <DataRow
      caption={
        <FormattedMessage id="wallet.tx-list.modal.neur-destroy.liquidated-amount.caption" />
      }
      value={
        <MoneySuiteWidget
          icon={getIconForCurrency(transaction.currency)}
          currency={transaction.currency}
          largeNumber={transaction.amount}
          value={transaction.amount}
          currencyTotal={ECurrency.EUR}
          theme={ETheme.BLACK}
          size={ESize.MEDIUM}
          textPosition={ETextPosition.RIGHT}
          inputFormat={transaction.amountFormat}
        />
      }
    />
  </>
);

export { NEurDestroyTransactionDetails };
