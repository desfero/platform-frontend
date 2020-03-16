import { ECurrency, ENumberInputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETransactionType } from "../../../../lib/api/analytics-api/interfaces";
import { TExtractTxHistoryFromType } from "../../../../modules/tx-history/types";
import { etoPublicViewByIdLinkLegacy } from "../../../appRouteUtils";
import { DataRow, DataRowSeparator } from "../../../shared/DataRow";
import { getIconForCurrency } from "../../../shared/icons/CurrencyIcon";
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
  transaction: TExtractTxHistoryFromType<ETransactionType.ETO_TOKENS_CLAIM>;
}

const EtoTokensClaimTransactionDetails: React.FunctionComponent<IExternalProps> = ({
  transaction,
}) => (
  <>
    <p>
      <ExternalLink href={etoPublicViewByIdLinkLegacy(transaction.etoId)}>
        <FormattedMessage id="wallet.tx-list.modal.common.view-company-profile" />
      </ExternalLink>
    </p>

    <BasicTransactionDetails date={transaction.date} />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.eto-tokens-claim.neu-reward.caption" />}
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

    <DataRowSeparator />

    <DataRow
      caption={
        <FormattedMessage id="wallet.tx-list.modal.eto-tokens-claim.claimed-amount.caption" />
      }
      value={
        <MoneySingleSuiteWidget
          icon={transaction.icon}
          currency={transaction.currency}
          value={transaction.amount}
          theme={ETheme.BLACK}
          size={ESize.MEDIUM}
          textPosition={ETextPosition.RIGHT}
          inputFormat={transaction.amountFormat}
        />
      }
    />
  </>
);

export { EtoTokensClaimTransactionDetails };
