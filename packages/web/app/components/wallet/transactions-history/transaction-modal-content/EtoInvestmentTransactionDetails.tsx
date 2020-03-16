import { ECurrency, ENumberInputFormat } from "@neufund/shared";
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
  MoneySingleSuiteWidget,
  MoneySuiteWidget,
} from "../../../shared/MoneySuiteWidget/MoneySuiteWidget";
import { BasicTransactionDetails } from "./BasicTransactionDetails";

interface IExternalProps {
  transaction: TExtractTxHistoryFromType<ETransactionType.ETO_INVESTMENT>;
}

const EtoInvestmentTransactionDetails: React.FunctionComponent<IExternalProps> = ({
  transaction,
}) => (
  <>
    <p>
      <ExternalLink href={etoPublicViewByIdLinkLegacy(transaction.etoId)}>
        <FormattedMessage id="wallet.tx-list.modal.common.view-company-profile" />
      </ExternalLink>
    </p>

    <BasicTransactionDetails date={transaction.date} status={transaction.subType} />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.common.to-address.caption" />}
      value={<EtherscanAddressLink address={transaction.toAddress} />}
      clipboardCopyValue={transaction.toAddress}
    />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.common.from-address.caption" />}
      value={<EtherscanAddressLink address={transaction.fromAddress} />}
      clipboardCopyValue={transaction.fromAddress}
    />

    <DataRowSeparator />

    <DataRow
      caption={
        <FormattedMessage id="wallet.tx-list.modal.eto-investment.amount-invested.caption" />
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

    <DataRow
      caption={
        <FormattedMessage id="wallet.tx-list.modal.eto-investment.amount-received.caption" />
      }
      value={
        <MoneySingleSuiteWidget
          icon={transaction.equityTokenIcon}
          currency={transaction.equityTokenCurrency}
          value={transaction.equityTokenAmount}
          inputFormat={transaction.equityTokenAmountFormat}
          theme={ETheme.BLACK}
          size={ESize.MEDIUM}
          textPosition={ETextPosition.RIGHT}
        />
      }
    />

    {!transaction.isICBMInvestment && (
      <DataRow
        caption={
          <FormattedMessage id="wallet.tx-list.modal.eto-investment.amount-rewarded.caption" />
        }
        value={
          <MoneySuiteWidget
            icon={getIconForCurrency(ECurrency.NEU)}
            currency={ECurrency.NEU}
            largeNumber={transaction.neuReward}
            value={transaction.neuRewardEur}
            currencyTotal={ECurrency.EUR}
            theme={ETheme.BLACK}
            size={ESize.MEDIUM}
            textPosition={ETextPosition.RIGHT}
            inputFormat={ENumberInputFormat.ULPS}
          />
        }
      />
    )}
  </>
);

export { EtoInvestmentTransactionDetails };
