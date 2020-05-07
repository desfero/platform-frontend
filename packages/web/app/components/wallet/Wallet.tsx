import * as React from "react";
import { branch, renderComponent, withProps } from "recompose";
import { compose } from "redux";
import { DeepReadonly, withContainer } from "@neufund/shared-utils";
import { FormattedMessage } from "react-intl-phraseapp";
import {
  Button,
  DashboardTitle,
  EButtonLayout,
  EButtonSize,
  Table,
  TokenIcon
} from "@neufund/design-system";

import { EBankTransferType } from "../../modules/bank-transfer-flow/reducer";
import { appConnect } from "../../store";
import { Container, EColumnSpan, EContainerType } from "../layouts/Container";
import { LoadingIndicatorContainer } from "../shared/loading-indicator";
import { TransactionsHistory } from "./transactions-history/TransactionsHistory";
import { WalletContainer } from "./WalletContainer";
import { actions } from "../../modules/actions";
import { WalletAddress } from "../shared/AccountAddress";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "../shared/formatters/utils";
import { Money } from "../shared/formatters/Money";
import { selectWalletViewData } from "../../modules/wallet-view/selectors";
import { PanelRounded } from "../shared/Panel";
import { EProcessState } from "../../utils/enums/processStates";
import { CommonBalance } from "./Balance";
import { BankAccount, NoBankAccount } from "./BankAccount";
import {
  TBalance,
  TBalanceActions,
  TBalanceData,
  TWalletViewReadyState,
  TWalletViewState
} from "../../modules/wallet-view/types";
import { balanceActions, balanceNames, balanceSymbols} from "./utils";

import * as styles from "./Wallet.module.scss"

type TStateProps = DeepReadonly<TWalletViewState>

type TReadyStateProps = TWalletViewReadyState & {balances:TBalance[]}

type TDispatchProps = {
  balanceActions: TBalanceActions
  verifyBankAccount: () => void;
}

const Balance = (balance:TBalance) => ({
    logo: <TokenIcon srcSet={{ "1x": balance.logo }} alt="" className={styles.tokenIcon} />,
    balanceName: balance.balanceName,
    amount: <>
      <Money
        value={balance.amount}
        inputFormat={ENumberInputFormat.ULPS}
        outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
        valueType={ECurrency.ETH}
      />
      <span className={styles.euroEquivalent}>
                    {"≈"}
        <Money
          value={balance.euroEquivalentAmount}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          valueType={ECurrency.EUR}
        />
                </span>
    </>,
    balanceActions: balance.walletActions.map((balanceAction, i) =>
      <Button
        key={i}
        layout={EButtonLayout.PRIMARY}
        size={EButtonSize.SMALL}
        onClick={balanceAction.dispatchAction}
        disabled={balanceAction.disableIf(balance)}
      >
        {balanceAction.text}
      </Button>
    )
  });

export const WalletLayout: React.FunctionComponent<TReadyStateProps & TDispatchProps> = ({
  balances,
  walletBalanceEuro,
  userAddress,
  verifyBankAccount,
  bankAccount,
}) => (
    <>
      <Container columnSpan={EColumnSpan.TWO_COL} type={EContainerType.INHERIT_GRID}>
        <Container columnSpan={EColumnSpan.TWO_COL}>
          <DashboardTitle titleText={<FormattedMessage id="wallet.title" />} />
        </Container>

        <Container columnSpan={EColumnSpan.TWO_COL}>
          <CommonBalance walletBalanceEuro={walletBalanceEuro} />
        </Container>


        <Container columnSpan={EColumnSpan.TWO_COL}>
          <PanelRounded>
            <Table
              CustomHeader={() => null}
              columns={[
                { accessor: "logo", Cell: ({ cell }) => <div className={styles.currencyLogo}>{cell.value}</div> },
                { accessor: "balanceName", Cell: ({ cell }) => <div className={styles.currency}>{cell.value}</div> },
                { accessor: "amount", Cell: ({ cell }) => <div className={styles.amount}>{cell.value}</div> },
                { accessor: "balanceActions", Cell: ({ cell }) => <div className={styles.balanceActions}>{cell.value}</div> },
              ]}
              data={balances
                .map(w => Balance(w))
              }
            />
          </PanelRounded>
        </Container>

        {/*{lockedWalletData.hasFunds && <LockedWallet data={lockedWalletData} />}*/}

        {/*{icbmWalletData.hasFunds && (*/}
        {/*  <IcbmWallet*/}
        {/*    className="h-100"*/}
        {/*    onUpgradeEuroClick={upgradeWalletEuroToken}*/}
        {/*    onUpgradeEtherClick={upgradeWalletEtherToken}*/}
        {/*    data={icbmWalletData}*/}
        {/*  />*/}
        {/*)}*/}

        {process.env.NF_TRANSACTIONS_HISTORY_VISIBLE === "1" && (
          <Container columnSpan={EColumnSpan.TWO_COL}>
            <TransactionsHistory />
          </Container>
        )}
      </Container>
      <Container columnSpan={EColumnSpan.ONE_COL} type={EContainerType.INHERIT_GRID}>
        <Container className={styles.walletAddressWrapper} columnSpan={EColumnSpan.ONE_COL}>
          <div className={styles.asideTitle}>
            <FormattedMessage id="wallet.wallet-address" />
          </div>
          <WalletAddress address={userAddress} />
        </Container>

        <Container className={styles.walletAddressWrapper} columnSpan={EColumnSpan.ONE_COL}>
          {(bankAccount && bankAccount.hasBankAccount)
            ? <BankAccount bankAccount={bankAccount} verifyBankAccount={verifyBankAccount} />
            : <NoBankAccount verifyBankAccount={verifyBankAccount} />
          }
        </Container>
      </Container>
    </>
  );

export const Wallet = compose<React.FunctionComponent>(
  appConnect<TStateProps, TDispatchProps>({
    stateToProps: state => {
      return ({
      ...selectWalletViewData(state)
    })},
    dispatchToProps: dispatch => ({
      balanceActions: balanceActions(dispatch),
      verifyBankAccount: () =>
        dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.VERIFY)),
    }),
  }),
  withContainer(WalletContainer),
  branch<TStateProps>(props => props.processState === EProcessState.ERROR, renderComponent(LoadingIndicatorContainer)), //fixme
  branch<TStateProps>(props => props.processState !== EProcessState.SUCCESS, renderComponent(LoadingIndicatorContainer)),
  withProps<{},TWalletViewReadyState & TDispatchProps>(({balanceData, balanceActions}) => ({
    balances: balanceData.map((wallet: TBalanceData) => ({
      logo: balanceSymbols[wallet.name],
      balanceName: balanceNames[wallet.name],
      amount: wallet.amount,
      euroEquivalentAmount: wallet.euroEquivalentAmount,
      walletActions: balanceActions[wallet.name]
    }))
  }))
)(WalletLayout);
