import { assertNever } from "@neufund/shared-utils";
import * as React from "react";

import { ETransactionType, TTxHistory } from "../../../modules/tx-history/types";
import { CommonHtmlProps, TTranslatedString } from "../../../types";
import { EHeadingSize, Heading } from "../../shared/Heading";
import { EtherscanTxLink } from "../../shared/links/EtherscanLink";
import { TransactionName } from "../../shared/transaction/TransactionName";
import { EtoInvestmentTransactionDetails } from "./transaction-modal-content/EtoInvestmentTransactionDetails";
import { EtoRefundTransactionsDetails } from "./transaction-modal-content/EtoRefundTransactionDetails";
import { EtoTokensClaimTransactionDetails } from "./transaction-modal-content/EtoTokensClaimTransactionDetails";
import { NEurDestroyTransactionDetails } from "./transaction-modal-content/NEurDestroyTransactionDetails";
import { NEurPurchaseTransactionDetails } from "./transaction-modal-content/NEurPurchaseTransactionDetails";
import { NEurRedeemTransactionDetails } from "./transaction-modal-content/NEurRedeemTransactionDetails";
import { PayoutTransactionsDetails } from "./transaction-modal-content/PayoutTransactionDetails";
import { RedistributePayoutTransactionsDetails } from "./transaction-modal-content/RedistributePayoutTransactionDetails";
import { TransferTransactionDetails } from "./transaction-modal-content/TransferTransactionDetails";

import * as styles from "./TransactionDetailsModal.module.scss";

interface IExternalProps {
  closeModal: () => void;
  transaction: TTxHistory;
}

const ModalHeading: React.FunctionComponent<{ children: TTranslatedString } & CommonHtmlProps> = ({
  children,
  className,
}) => (
  <Heading
    size={EHeadingSize.HUGE}
    level={4}
    decorator={false}
    disableTransform={true}
    className={className}
  >
    {children}
  </Heading>
);

const TransactionTypeToComponentMap: React.FunctionComponent<IExternalProps> = ({
  transaction,
}) => {
  switch (transaction.type) {
    case ETransactionType.TRANSFER:
      return <TransferTransactionDetails transaction={transaction} />;
    case ETransactionType.NEUR_PURCHASE:
      return <NEurPurchaseTransactionDetails transaction={transaction} />;
    case ETransactionType.ETO_TOKENS_CLAIM:
      return <EtoTokensClaimTransactionDetails transaction={transaction} />;
    case ETransactionType.NEUR_DESTROY:
      return <NEurDestroyTransactionDetails transaction={transaction} />;
    case ETransactionType.ETO_REFUND:
      return <EtoRefundTransactionsDetails transaction={transaction} />;
    case ETransactionType.REDISTRIBUTE_PAYOUT:
      return <RedistributePayoutTransactionsDetails transaction={transaction} />;
    case ETransactionType.PAYOUT:
      return <PayoutTransactionsDetails transaction={transaction} />;
    case ETransactionType.ETO_INVESTMENT:
      return <EtoInvestmentTransactionDetails transaction={transaction} />;
    case ETransactionType.NEUR_REDEEM:
      return <NEurRedeemTransactionDetails transaction={transaction} />;
    default:
      return assertNever(transaction, "Can't find component related to transaction");
  }
};

export const TransactionDetailsModal: React.FunctionComponent<IExternalProps> = props => (
  <section className={styles.contentWrapper} data-test-id="transaction-history-details-modal">
    <ModalHeading>
      <TransactionName transaction={props.transaction} />
    </ModalHeading>

    <TransactionTypeToComponentMap {...props} />

    <EtherscanTxLink txHash={props.transaction.txHash}>Etherscan</EtherscanTxLink>
  </section>
);
