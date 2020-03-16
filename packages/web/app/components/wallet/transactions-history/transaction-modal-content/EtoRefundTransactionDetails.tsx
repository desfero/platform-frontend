import { ECurrency } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETransactionType } from "../../../../lib/api/analytics-api/interfaces";
import { TExtractTxHistoryFromType } from "../../../../modules/tx-history/types";
import { etoPublicViewByIdLinkLegacy } from "../../../appRouteUtils";
import { DataRow, DataRowSeparator } from "../../../shared/DataRow";
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
  transaction: TExtractTxHistoryFromType<ETransactionType.ETO_REFUND>;
}

const EtoRefundTransactionsDetails: React.FunctionComponent<IExternalProps> = ({ transaction }) => (
  <>
    <p>
      <ExternalLink href={etoPublicViewByIdLinkLegacy(transaction.etoId)}>
        <FormattedMessage id="wallet.tx-list.modal.common.view-company-profile" />
      </ExternalLink>
    </p>

    <BasicTransactionDetails date={transaction.date} />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.eto-refund.paid-out-to.caption" />}
      value={<EtherscanAddressLink address={transaction.toAddress} />}
      clipboardCopyValue={transaction.toAddress}
    />

    <DataRowSeparator />

    <DataRow
      caption={
        <FormattedMessage id="wallet.tx-list.modal.eto-refund.investment-refunded.caption" />
      }
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

export { EtoRefundTransactionsDetails };
