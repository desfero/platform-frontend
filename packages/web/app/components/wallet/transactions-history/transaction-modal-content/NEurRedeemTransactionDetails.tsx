import {
  ETransactionStatus,
  ETransactionType,
  TExtractTxHistoryFromType,
} from "@neufund/shared-modules";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { externalRoutes } from "../../../../config/externalRoutes";
import { DataRow, DataRowSeparator } from "../../../shared/DataRow";
import { Money } from "../../../shared/formatters/Money";
import { ECurrency, ENumberOutputFormat } from "../../../shared/formatters/utils";
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
  transaction: TExtractTxHistoryFromType<ETransactionType.NEUR_REDEEM>;
}

const NEurRedeemTransactionDetails: React.FunctionComponent<IExternalProps> = ({ transaction }) => (
  <>
    <BasicTransactionDetails date={transaction.date} status={transaction.subType} />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.neur-purchase.handled-by.caption" />}
      value={
        <ExternalLink href={externalRoutes.quintessenceLanding}>
          <FormattedMessage id="wallet.tx-list.modal.neur-purchase.handled-by.value" />
        </ExternalLink>
      }
    />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.common.from-address.caption" />}
      value={<EtherscanAddressLink address={transaction.fromAddress} />}
      clipboardCopyValue={transaction.fromAddress}
    />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.neur-redeem.reference.caption" />}
      value={transaction.reference}
      clipboardCopyValue={transaction.reference}
    />

    <DataRowSeparator />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.neur-redeem.amount-redeemed.caption" />}
      value={
        <MoneySuiteWidget
          icon={getIconForCurrency(transaction.currency)}
          currency={transaction.currency}
          largeNumber={transaction.amount}
          value={transaction.amount}
          inputFormat={transaction.amountFormat}
          currencyTotal={ECurrency.EUR}
          theme={ETheme.BLACK}
          size={ESize.MEDIUM}
          textPosition={ETextPosition.RIGHT}
        />
      }
    />

    {transaction.subType === ETransactionStatus.COMPLETED && (
      <>
        <DataRow
          caption={<FormattedMessage id="wallet.tx-list.modal.neur-redeem.bank-fee.caption" />}
          value={
            <Money
              value={transaction.feeAmount}
              inputFormat={transaction.amountFormat}
              outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
              valueType={transaction.currency}
            />
          }
        />

        <DataRow
          caption={
            <FormattedMessage id="wallet.tx-list.modal.neur-redeem.settled-amount.caption" />
          }
          value={
            <Money
              value={transaction.settledAmount}
              inputFormat={transaction.amountFormat}
              outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
              valueType={transaction.currency}
            />
          }
        />
      </>
    )}
  </>
);

export { NEurRedeemTransactionDetails };
