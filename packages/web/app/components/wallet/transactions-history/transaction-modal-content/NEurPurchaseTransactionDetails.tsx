import { ETransactionType, TExtractTxHistoryFromType } from "@neufund/shared-modules";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { externalRoutes } from "../../../../config/externalRoutes";
import { DataRow, DataRowSeparator } from "../../../shared/DataRow";
import { ECurrency } from "../../../shared/formatters/utils";
import { getIconForCurrency } from "../../../shared/icons/CurrencyIcon";
import { EtherscanAddressLink } from "../../../shared/links/EtherscanLink";
import { ExternalLink } from "../../../shared/links/ExternalLink";
import {
  ESize,
  ETextPosition,
  ETheme,
  MoneySuiteWidget,
} from "../../../shared/MoneySuiteWidget/MoneySuiteWidget";
import { BasicTransactionDetails } from "./BasicTransactionDetails";

interface IExternalProps {
  transaction: TExtractTxHistoryFromType<ETransactionType.NEUR_PURCHASE>;
}

const NEurPurchaseTransactionDetails: React.FunctionComponent<IExternalProps> = ({
  transaction,
}) => (
  <>
    <BasicTransactionDetails date={transaction.date} />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.neur-purchase.handled-by.caption" />}
      value={
        <ExternalLink href={externalRoutes.quintessenceLanding}>
          <FormattedMessage id="wallet.tx-list.modal.neur-purchase.handled-by.value" />
        </ExternalLink>
      }
    />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.common.to-address.caption" />}
      clipboardCopyValue={transaction.toAddress}
      value={<EtherscanAddressLink address={transaction.toAddress} />}
    />

    <DataRowSeparator />

    <DataRow
      caption={
        <FormattedMessage id="wallet.tx-list.modal.neur-purchase.purchased-amount.caption" />
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

export { NEurPurchaseTransactionDetails };
