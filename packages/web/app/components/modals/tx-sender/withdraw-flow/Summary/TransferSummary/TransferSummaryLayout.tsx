import { Button, ButtonArrowLeft, EButtonWidth } from "@neufund/design-system";
import { addBigNumbers, ECurrency, RequiredByKeys, toEquityTokenSymbol } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TTokenTransferAdditionalData } from "../../../../../../modules/tx/transactions/token-transfer/types";
import { TWithdrawAdditionalData } from "../../../../../../modules/tx/transactions/withdraw/types";
import {
  toFixedPrecisionAmountEth,
  toFixedPrecisionAmountEur,
  toFixedPrecisionGasCostEth,
  toFixedPrecisionGasCostEur,
} from "../../../../../../modules/tx/user-flow/transfer/utils";
import { DataRow, DataRowSeparator } from "../../../../../shared/DataRow";
import { EtherscanTxLink } from "../../../../../shared/links";
import { TokenTotalFormField } from "../../Init/TokenTotalFormField/TokenTotalFormField";
import { TokenAmount } from "../../shared/TokenAmount";
import { TransferHeader } from "../../shared/TransferHeader";
import { TransactionFeeWidget } from "../../TransferTransactionLayout/TransactionFeeWidget";

import * as styles from "../../Transfer.module.scss";

export interface ITransferSummaryStateProps {
  additionalData?: TWithdrawAdditionalData | TTokenTransferAdditionalData;
  walletAddress: string;
  gasCost: string;
  gasCostEur: string;
}

export interface ITransferSummaryDispatchProps {
  onAccept: () => void;
  onChange: () => void;
}

export type TTransferSummaryProps = RequiredByKeys<ITransferSummaryStateProps, "additionalData"> &
  ITransferSummaryDispatchProps;

export const TransferSummaryLayout: React.FunctionComponent<TTransferSummaryProps> = ({
  additionalData,
  onAccept,
  onChange,
  walletAddress,
  gasCost,
  gasCostEur,
}) => {
  const gasCostAsViewed = toFixedPrecisionGasCostEth(gasCost);
  const gasCostAsViewedEur = toFixedPrecisionGasCostEur(gasCostEur);
  const amountAsViewed = toFixedPrecisionAmountEth(additionalData.amount);
  const amountAsViewedEur = toFixedPrecisionAmountEur(additionalData.amountEur);
  const total = addBigNumbers([gasCostAsViewed, amountAsViewed]);
  const totalEur = addBigNumbers([gasCostAsViewedEur, amountAsViewedEur]);

  return (
    <TransferHeader
      tokenSymbol={additionalData.tokenSymbol}
      data-test-id="modals.shared.tx-transfer.modal"
    >
      <ButtonArrowLeft
        className={styles.withSpacing}
        onClick={onChange}
        width={EButtonWidth.NO_PADDING}
      >
        <FormattedMessage id="modal.sent-eth.change" />
      </ButtonArrowLeft>

      <DataRow
        className={styles.withSpacing}
        caption={<FormattedMessage id="modal.sent-eth.from-address" />}
        value={
          <EtherscanTxLink txHash={walletAddress}>
            <FormattedMessage id="modal.sent-eth.my-balance" />
          </EtherscanTxLink>
        }
        clipboardCopyValue={walletAddress}
      />
      <DataRow
        className={styles.withSpacing}
        caption={<FormattedMessage id="modal.sent-eth.to-address" />}
        value={<EtherscanTxLink txHash={additionalData.to} />}
        clipboardCopyValue={additionalData.to}
      />
      <DataRowSeparator />
      <TokenAmount
        amount={additionalData.amount}
        amountEur={additionalData.amountEur}
        tokenSymbol={toEquityTokenSymbol(additionalData.tokenSymbol)}
        tokenImage={additionalData.tokenImage}
        tokenDecimals={additionalData.tokenDecimals}
        caption={<FormattedMessage id="modal.transfer.amount-to-send" />}
      />

      <DataRow
        className={styles.withSpacing}
        caption={<FormattedMessage id="modal.sent-eth.transaction-fee" />}
        value={<TransactionFeeWidget cost={gasCostAsViewed} costEur={gasCostAsViewedEur} />}
      />

      {additionalData.tokenSymbol === ECurrency.ETH && (
        <>
          <DataRowSeparator />
          <TokenTotalFormField total={total} totalEur={totalEur} />
        </>
      )}

      <section className="text-center">
        <Button onClick={onAccept} data-test-id="modals.tx-sender.withdraw-flow.summary.accept">
          <FormattedMessage id="withdraw-flow.confirm-button" />
        </Button>
      </section>
    </TransferHeader>
  );
};
