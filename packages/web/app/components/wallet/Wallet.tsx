import * as React from "react";
import { branch, renderComponent, withProps } from "recompose";
import { compose } from "redux";
import { DeepReadonly, withContainer } from "@neufund/shared-utils";
import { FormattedMessage } from "react-intl-phraseapp";

import { EBankTransferType } from "../../modules/bank-transfer-flow/reducer";
import { appConnect } from "../../store";
import { Container, EColumnSpan, EContainerType } from "../layouts/Container";
import { LoadingIndicatorContainer } from "../shared/loading-indicator";
import { TransactionsHistory } from "./transactions-history/TransactionsHistory";
import { WalletContainer } from "./WalletContainer";
import { actions } from "../../modules/actions";
import { WalletAddress } from "../shared/AccountAddress";
import { selectWalletViewData } from "../../modules/wallet-view/selectors";
import { PanelRounded } from "../shared/Panel";
import { EProcessState } from "../../utils/enums/processStates";
import { BalanceTotal } from "./BalanceTotal";
import { BankAccount, NoBankAccount } from "./BankAccount";
import {
  TBalance,
  TBalanceActions,
  TBalanceData,
  TWalletViewReadyState,
  TWalletViewState
} from "../../modules/wallet-view/types";
import { balanceActions, balanceAdditionalInfo, balanceCurrencies, balanceNames, balanceSymbols } from "./utils";
import { Balance } from "./Balance";
import { ECustomTooltipTextPosition, Tooltip } from "../shared/tooltips";
import { Heading } from "../shared/Heading";
import { ErrorBoundaryComponent } from "../shared/errorBoundary/ErrorBoundaryLayout";

import * as styles from "./Wallet.module.scss"

type TStateProps = DeepReadonly<TWalletViewState>

type TReadyStateProps = TWalletViewReadyState & { balances: TBalance[] }

type TDispatchProps = {
  balanceActions: TBalanceActions
  verifyBankAccount: () => void;
}

export const WalletLayout: React.FunctionComponent<TReadyStateProps & TDispatchProps> = ({
  balances,
  totalBalanceEuro,
  userAddress,
  verifyBankAccount,
  bankAccount,
  userIsFullyVerified
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
        <PanelRounded>
          <li className={styles.balanceList}>
            {balances.map(b => <Balance {...b} key={b.balanceName} />)
            }
          </li>
        </PanelRounded>
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
        {(bankAccount && bankAccount.hasBankAccount)
          ? <BankAccount bankAccountData={bankAccount.details} verifyBankAccount={verifyBankAccount} userIsFullyVerified={userIsFullyVerified} />
          : <NoBankAccount verifyBankAccount={verifyBankAccount} />
        }
      </Container>
    </Container>

    {process.env.NF_TRANSACTIONS_HISTORY_VISIBLE === "1" && (
      <Container columnSpan={EColumnSpan.TWO_COL} className={styles.transactionHistory}>
        <Heading level={4} decorator={false}>
          <FormattedMessage id="wallet.tx-list.heading" />
          <Tooltip
            data-test-id="transactions.info"
            content={
              <FormattedMessage
                id="wallet.tx-list.tooltip"
              />
            }
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
    stateToProps: state => {
      return ({
        ...selectWalletViewData(state),
      })
    },
    dispatchToProps: dispatch => ({
      balanceActions: balanceActions(dispatch),
      verifyBankAccount: () =>
        dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.VERIFY)),
    }),
  }),
  withContainer(WalletContainer),
  branch<TStateProps>(props => props.processState === EProcessState.ERROR, renderComponent(ErrorBoundaryComponent)),
  branch<TStateProps>(props => props.processState !== EProcessState.SUCCESS, renderComponent(LoadingIndicatorContainer)),
  withProps<{ balances: TBalance[] }, TWalletViewReadyState & TDispatchProps>(({ balanceData, balanceActions }) => ({
    balances: balanceData.map((wallet: TBalanceData) => ({
      logo: balanceSymbols[wallet.name],
      balanceName: balanceNames[wallet.name],
      balanceAdditionalInfo: balanceAdditionalInfo[wallet.name],
      amount: wallet.amount,
      currency: balanceCurrencies[wallet.name],
      euroEquivalentAmount: wallet.euroEquivalentAmount,
      walletActions: balanceActions[wallet.name]
    }))
  }))
)(WalletLayout);
