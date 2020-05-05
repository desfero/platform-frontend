import { ETransactionDirection, ETransactionType, TTxHistory } from "@neufund/shared-modules";
import { assertNever } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { selectUnits } from "../formatters/utils";

type TExternalProps = { transaction: TTxHistory };

const TransactionName: React.FunctionComponent<TExternalProps> = ({ transaction }) => {
  switch (transaction.type) {
    case ETransactionType.TRANSFER: {
      switch (transaction.transactionDirection) {
        case ETransactionDirection.IN:
          return (
            <FormattedMessage
              id="wallet.tx-list.name.transfer.received"
              values={{ currency: selectUnits(transaction.currency) }}
            />
          );
        case ETransactionDirection.OUT:
          return (
            <FormattedMessage
              id="wallet.tx-list.name.transfer.transferred"
              values={{ currency: selectUnits(transaction.currency) }}
            />
          );
        default:
          return assertNever(transaction.transactionDirection, "Invalid transaction direction");
      }
    }
    case ETransactionType.ETO_INVESTMENT: {
      if (transaction.isICBMInvestment) {
        return (
          <FormattedMessage
            id="wallet.tx-list.name.eto-icbm-investment"
            values={{ companyName: transaction.companyName }}
          />
        );
      } else {
        return (
          <FormattedMessage
            id="wallet.tx-list.name.eto-investment"
            values={{ companyName: transaction.companyName }}
          />
        );
      }
    }
    case ETransactionType.ETO_REFUND:
      return (
        <FormattedMessage
          id="wallet.tx-list.name.eto-refund"
          values={{ companyName: transaction.companyName }}
        />
      );
    case ETransactionType.NEUR_PURCHASE:
      return (
        <FormattedMessage
          id="wallet.tx-list.name.neur-purchase"
          values={{ currency: selectUnits(transaction.currency) }}
        />
      );
    case ETransactionType.NEUR_REDEEM:
      return (
        <FormattedMessage
          id="wallet.tx-list.name.neur-redeem"
          values={{ currency: selectUnits(transaction.currency) }}
        />
      );
    case ETransactionType.NEUR_DESTROY:
      return (
        <FormattedMessage
          id="wallet.tx-list.name.neur-destroy"
          values={{ currency: selectUnits(transaction.currency) }}
        />
      );
    case ETransactionType.ETO_TOKENS_CLAIM:
      return (
        <FormattedMessage
          id="wallet.tx-list.name.eto-tokens-claim"
          values={{ currency: selectUnits(transaction.currency) }}
        />
      );
    case ETransactionType.REDISTRIBUTE_PAYOUT:
      return (
        <FormattedMessage
          id="wallet.tx-list.name.redistribute-payout"
          values={{ currency: selectUnits(transaction.currency) }}
        />
      );
    case ETransactionType.PAYOUT:
      return (
        <FormattedMessage
          id="wallet.tx-list.name.payout"
          values={{ currency: selectUnits(transaction.currency) }}
        />
      );
    default:
      return assertNever(transaction, "Unsupported transaction type");
  }
};

export { TransactionName };
