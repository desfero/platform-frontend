import { DeepReadonly, withContainer } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, renderComponent, withProps } from "recompose";
import { compose } from "redux";

import { actions } from "../../modules/actions";
import { EBankTransferType } from "../../modules/bank-transfer-flow/reducer";
import { selectWalletViewData } from "../../modules/wallet-view/selectors";
import {
  TBalance,
  TBalanceActions,
  TBalanceData,
  TWalletViewReadyState,
  TWalletViewState,
} from "../../modules/wallet-view/types";
import { appConnect } from "../../store";
import { EProcessState } from "../../utils/enums/processStates";
import { Container, EColumnSpan, EContainerType } from "../layouts/Container";
import { WalletAddress } from "../shared/AccountAddress";
import { ErrorBoundaryComponent } from "../shared/errorBoundary/ErrorBoundaryLayout";
import { Heading } from "../shared/Heading";
import { LoadingIndicatorContainer } from "../shared/loading-indicator";
import { ECustomTooltipTextPosition, Tooltip } from "../shared/tooltips";
import { BalanceList } from "./BalanceList";
import { BalanceTotal } from "./BalanceTotal";
import { BankAccount, NoBankAccount } from "./BankAccount";
import { TransactionsHistory } from "./transactions-history/TransactionsHistory";
import {
  balanceAdditionalInfo,
  balanceCurrencies,
  balanceNames,
  balanceSymbols,
  createBalanceActions,
} from "./utils";
import { WalletContainer } from "./WalletContainer";

import * as styles from "./Wallet.module.scss";

type TStateProps = DeepReadonly<TWalletViewState>;

type TReadyStateProps = TWalletViewReadyState & { balances: TBalance[] };

type TDispatchProps = {
  balanceActions: TBalanceActions;
  verifyBankAccount: () => void;
};

export const WalletLayout: React.FunctionComponent<TReadyStateProps & TDispatchProps> = ({
  balances,
  totalBalanceEuro,
  userAddress,
  verifyBankAccount,
  bankAccount,
  userIsFullyVerified,
}) => (
  <>
    <Container columnSpan={EColumnSpan.TWO_COL} type={EContainerType.INHERIT_GRID}>
      <Container columnSpan={EColumnSpan.TWO_COL}>
        <Heading level={2} decorator={false}>
          <FormattedMessage id="wallet.title" />
        </Heading>
      </Container>

      <Container columnSpan={EColumnSpan.TWO_COL}>
        <BalanceTotal totalBalanceEuro={totalBalanceEuro} />
      </Container>

      <Container columnSpan={EColumnSpan.TWO_COL}>
        <BalanceList balances={balances} />
      </Container>
    </Container>

    <Container columnSpan={EColumnSpan.ONE_COL} type={EContainerType.INHERIT_GRID}>
      <Container className={styles.walletAddressWrapper} columnSpan={EColumnSpan.ONE_COL}>
        <h2 className={styles.subtitle}>
          <FormattedMessage id="wallet.wallet-address" />
        </h2>
        <WalletAddress address={userAddress} data-test-id="wallet.wallet-address" />
      </Container>

      <Container className={styles.walletAddressWrapper} columnSpan={EColumnSpan.ONE_COL}>
        {bankAccount && bankAccount.hasBankAccount ? (
          <BankAccount
            bankAccountData={bankAccount.details}
            verifyBankAccount={verifyBankAccount}
            userIsFullyVerified={userIsFullyVerified}
          />
        ) : (
          <NoBankAccount verifyBankAccount={verifyBankAccount} />
        )}
      </Container>
    </Container>

    {process.env.NF_TRANSACTIONS_HISTORY_VISIBLE === "1" && (
      <Container columnSpan={EColumnSpan.TWO_COL} className={styles.transactionHistory}>
        <Heading level={4} decorator={false}>
          <FormattedMessage id="wallet.tx-list.heading" />
          <Tooltip
            data-test-id="transactions.info"
            content={<FormattedMessage id="wallet.tx-list.tooltip" />}
            textPosition={ECustomTooltipTextPosition.LEFT}
            preventDefault={false}
          />
        </Heading>
        <TransactionsHistory />
      </Container>
    )}
  </>
);

export const Wallet = compose<React.FunctionComponent>(
  appConnect<TStateProps, TDispatchProps>({
    stateToProps: state => ({
      ...selectWalletViewData(state),
    }),
    dispatchToProps: dispatch => ({
      balanceActions: createBalanceActions(dispatch),
      verifyBankAccount: () =>
        dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.VERIFY)),
    }),
  }),
  withContainer(WalletContainer),
  branch<TStateProps>(
    props => props.processState === EProcessState.ERROR,
    renderComponent(ErrorBoundaryComponent),
  ),
  branch<TStateProps>(
    props => props.processState !== EProcessState.SUCCESS,
    renderComponent(LoadingIndicatorContainer),
  ),
  withProps<{ balances: TBalance[] }, TWalletViewReadyState & TDispatchProps>(
    ({ balanceData, balanceActions }) => ({
      balances: balanceData.map((wallet: TBalanceData) => ({
        logo: balanceSymbols[wallet.name],
        balanceName: balanceNames[wallet.name],
        balanceAdditionalInfo: balanceAdditionalInfo[wallet.name],
        amount: wallet.amount,
        currency: balanceCurrencies[wallet.name],
        euroEquivalentAmount: wallet.euroEquivalentAmount,
        walletActions: balanceActions[wallet.name],
      })),
    }),
  ),
)(WalletLayout);
