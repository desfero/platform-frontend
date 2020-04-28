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
  transaction: TExtractTxHistoryFromType<ETransactionType.PAYOUT>;
}

const PayoutTransactionsDetails: React.FunctionComponent<IExternalProps> = ({ transaction }) => (
  <>
    <BasicTransactionDetails date={transaction.date} />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.payout.to-address.caption" />}
      value={<EtherscanAddressLink address={transaction.toAddress} />}
      clipboardCopyValue={transaction.toAddress}
    />

    <DataRowSeparator />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.payout.amount.caption" />}
      value={
        <MoneySuiteWidget
          icon={getIconForCurrency(transaction.currency)}
          currency={transaction.currency}
          largeNumber={transaction.amount}
          value={transaction.amountEur}
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

export { PayoutTransactionsDetails };
