import * as React from "react";
import { branch, renderComponent } from "recompose";
import { compose } from "redux";
import { DeepReadonly, selectUnits, withContainer } from "@neufund/shared-utils";
import { FormattedMessage } from "react-intl-phraseapp";
import {
  Button,
  DashboardTitle,
  EButtonLayout,
  EButtonSize,
  Table,
  TokenIcon, TTranslatedString
} from "@neufund/design-system";

import { EBankTransferType } from "../../modules/bank-transfer-flow/reducer";
import { ETokenType } from "../../modules/tx/types";
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
import { hasBalance } from "../../modules/investment-flow/utils";
import { EBalanceType, TWalletData, TWalletViewState } from "../../modules/wallet-view/reducer";
import { EProcessState } from "../../utils/enums/processStates";
import { CommonBalance } from "./Balance";
import { BankAccount, NoBankAccount } from "./BankAccount";

import tokenIcon from "../../assets/img/eth_icon.svg"
import * as styles from "./Wallet.module.scss"

type TStateProps = DeepReadonly<TWalletViewState>

interface IDispatchProps {
  depositEthUnlockedWallet: () => void;
  withdrawEthUnlockedWallet: () => void;
  upgradeWalletEtherToken: () => void;
  upgradeWalletEuroToken: () => void;
  purchaseNEur: () => void;
  verifyBankAccount: () => void;
  redeemNEur: () => void;
}


type TProps = TStateProps & IDispatchProps;

const SingleWallet = (walletData) => {
  return ({
    logo: <TokenIcon srcSet={{ "1x": walletData.logo }} alt="" className={styles.tokenIcon} />,
    walletName: walletData.currencyName,
    value: <>
      <Money
        value={walletData.amount}
        inputFormat={ENumberInputFormat.ULPS}
        outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
        valueType={ECurrency.ETH}
      />
      <span className={styles.euroEquivalent}>
                    {"≈"}
        <Money
          value={walletData.euroEquivalentAmount}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          valueType={ECurrency.EUR}
        />
                </span>
    </>,
    actions: walletData.walletActions.map((walletAction, i) =>
      <Button
        key={i}
        layout={EButtonLayout.PRIMARY}
        size={EButtonSize.SMALL}
        onClick={walletAction.dispatchAction}
        // disabled={walletAction.condition(walletData)}
      >
        {walletAction.text}
      </Button>
    )
  })
}

const walletNames: { [key in EBalanceType]: string } = {
  [EBalanceType.ETH]: `${selectUnits(ECurrency.ETH)}`,
  [EBalanceType.NEUR]: `${selectUnits(ECurrency.EUR)}`,
  [EBalanceType.ICBM_ETH]: `Icbm ${selectUnits(ECurrency.ETH)}`,
  [EBalanceType.ICBM_NEUR]: `Icbm ${selectUnits(ECurrency.EUR)}`,
  [EBalanceType.LOCKED_ICBM_ETH]: `Icbm ${selectUnits(ECurrency.ETH)}`,
  [EBalanceType.LOCKED_ICBM_NEUR]: `Icbm ${selectUnits(ECurrency.EUR)}`,
}

const currencySymbols: { [key in EBalanceType]: string } = {
  [EBalanceType.ETH]: tokenIcon,
  [EBalanceType.NEUR]: tokenIcon,
  [EBalanceType.ICBM_ETH]: tokenIcon,
  [EBalanceType.ICBM_NEUR]: tokenIcon,
  [EBalanceType.LOCKED_ICBM_ETH]: tokenIcon,
  [EBalanceType.LOCKED_ICBM_NEUR]: tokenIcon,
}

const walletActions = (dispatch): { [key in EBalanceType]: { dispatchAction: Function, condition: (w: TWalletData) => boolean, text: TTranslatedString }[] } => ({
  [EBalanceType.ETH]: [
    {
      dispatchAction: () => dispatch(actions.txTransactions.startWithdrawEth()),
      condition: (data) => hasBalance(data.amount),
      text: <FormattedMessage id="shared-component.account-balance.send" />
    },
    {
      dispatchAction: () => dispatch(actions.depositEthModal.showDepositEthModal()),
      condition: () => true,
      text: <FormattedMessage id="shared-component.account-balance.receive" />
    }
  ],
  [EBalanceType.NEUR]: [
    {
      dispatchAction: () => dispatch(actions.txTransactions.startWithdrawNEuro()),
      condition: (data) => hasBalance(data.amount),
      text: <FormattedMessage id="components.wallet.start.neur-wallet.redeem" />
    },
    {
      dispatchAction: () => dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.PURCHASE)),
      condition: () => true,
      text: <FormattedMessage id="components.wallet.start.neur-wallet.purchase" />
    }
  ],
  [EBalanceType.ICBM_ETH]: [],
  [EBalanceType.ICBM_NEUR]: [],
  [EBalanceType.LOCKED_ICBM_ETH]: [{
    dispatchAction: () => dispatch(actions.txTransactions.startUpgrade(ETokenType.ETHER)),
    condition: () => true,
    text: <FormattedMessage id="wallet.enable-icbm" />
  }],
  [EBalanceType.LOCKED_ICBM_NEUR]: [{
    dispatchAction: () => dispatch(actions.txTransactions.startUpgrade(ETokenType.EURO)),
    condition: () => true,
    text: <FormattedMessage id="wallet.enable-icbm" />
  }],
})


export const WalletComponent: React.FunctionComponent<TProps> = (p) => {

  const {
    wallets,
    walletBalanceEuro,
    userAddress,
    verifyBankAccount,
    bankAccount
  } = p
  console.log("WalletComponent",p)

  const walletData = wallets.map((wallet: TWalletData) => {
    return {
      logo: currencySymbols[wallet.name],
      currencyName: walletNames[wallet.name],
      amount: wallet.amount,
      euroEquivalentAmount: wallet.euroEquivalentAmount,
      walletActions: walletActions[wallet.name]
    }
  })
    .map(w => {
        console.log(w)
        return SingleWallet(w)

      }
    )


  return (
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
                { accessor: "currency", Cell: ({ cell }) => <div className={styles.currency}>{cell.value}</div> },
                { accessor: "value", Cell: ({ cell }) => <div className={styles.amount}>{cell.value}</div> },
                { accessor: "actions", Cell: ({ cell }) => <div className={styles.walletActions}>{cell.value}</div> },
              ]}
              data={walletData}
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
  )
};

export const Wallet = compose<React.FunctionComponent>(
  appConnect<TStateProps, IDispatchProps>({
    stateToProps: state => {
      console.log("appConnect",JSON.stringify(state.walletView))
      return ({
      ...selectWalletViewData(state)
    })},
    dispatchToProps: dispatch => ({
      walletActions: walletActions(dispatch),
      verifyBankAccount: () =>
        dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.VERIFY)),
    }),
  }),
  withContainer(WalletContainer),
  branch<TStateProps>(props => props.processState === EProcessState.ERROR, renderComponent(LoadingIndicatorContainer)), //fixme
  branch<TStateProps>(props => props.processState !== EProcessState.SUCCESS, renderComponent(LoadingIndicatorContainer)),
)(WalletComponent);
