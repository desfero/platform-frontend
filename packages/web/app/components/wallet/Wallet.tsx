import * as React from "react";
import { branch, renderComponent, withProps } from "recompose";
import { compose } from "redux";
import { addBigNumbers, compareBigNumbers, DeepReadonly, selectUnits, withContainer } from "@neufund/shared-utils";
import { FormattedMessage, FormattedHTMLMessage } from "react-intl-phraseapp";
import {
  Button,
  ButtonInline,
  DashboardTitle,
  EButtonLayout,
  EButtonSize,
  Table,
  TokenIcon
} from "@neufund/design-system";

import { EBankTransferType } from "../../modules/bank-transfer-flow/reducer";
import { selectBankAccount, selectIndividualAddress } from "../../modules/kyc/selectors";
import { ETokenType } from "../../modules/tx/types";
import {
  selectICBMLockedEtherBalance,
  selectICBMLockedEtherBalanceEuroAmount,
  selectICBMLockedEuroTokenBalance,
  selectICBMLockedEuroTotalAmount,
  selectICBMLockedWalletHasFunds,
  selectIsEtherUpgradeTargetSet,
  selectIsEuroUpgradeTargetSet,
  selectIsLoading,
  selectLiquidEtherBalance,
  selectLiquidEtherBalanceEuroAmount,
  selectLiquidEuroTokenBalance,
  selectLiquidEuroTotalAmount,
  selectLockedEtherBalance,
  selectLockedEtherBalanceEuroAmount,
  selectLockedEuroTokenBalance,
  selectLockedEuroTotalAmount,
  selectLockedWalletHasFunds,
  selectNEURStatus,
  selectWalletError,
} from "../../modules/wallet/selectors";
import { ENEURWalletStatus } from "../../modules/wallet/types";
import { selectEthereumAddress } from "../../modules/web3/selectors";
import { appConnect } from "../../store";
import { onEnterAction } from "../../utils/react-connected-components/OnEnterAction";
import { Container, EColumnSpan, EContainerType } from "../layouts/Container";
import { LoadingIndicatorContainer } from "../shared/loading-indicator";
import { TransactionsHistory } from "./transactions-history/TransactionsHistory";
import { IcbmWallet, IIcbmWalletValues } from "./wallet-balance/IcbmWallet";
import { IWalletValues } from "./wallet-balance/WalletBalance";
import { WalletContainer } from "./WalletContainer";
import { actions } from "../../modules/actions";
import { WalletAddress } from "../shared/AccountAddress";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "../shared/formatters/utils";
import { ECurrencySymbol, Money } from "../shared/formatters/Money";
import { PanelRounded } from "../shared/Panel";

import tokenIcon from "../../assets/img/eth_icon.svg"
import * as styles from "./Wallet.module.scss"
import { hasBalance } from "../../modules/investment-flow/utils";
import { TBankAccount } from "../../modules/kyc/types";
import bankIcon from "../../assets/img/bank-transfer/bank-icon.svg";
import * as cn from "classnames";
import { BankNumber } from "./BankAccount";
import { LockedWallet } from "./wallet-balance/LockedWallet";
import { UnlockedETHWallet } from "./wallet-balance/UnlockedETHWallet";
import { UnlockedNEURWallet } from "./wallet-balance/UnlockedNEURWallet";

interface IStateProps {
  error?: string;
  liquidWalletData: IWalletValues;
  lockedWalletData: IWalletValues & { hasFunds: boolean };
  icbmWalletData: IIcbmWalletValues;
  userAddress: string;
  isLoading: boolean;
  neurStatus: ENEURWalletStatus;
  bankAccount: DeepReadonly<TBankAccount> | undefined
  individualAddress: ReturnType<typeof selectIndividualAddress>;
}

interface IDispatchProps {
  depositEthUnlockedWallet: () => void;
  withdrawEthUnlockedWallet: () => void;
  upgradeWalletEtherToken: () => void;
  upgradeWalletEuroToken: () => void;
  purchaseNEur: () => void;
  verifyBankAccount: () => void;
  redeemNEur: () => void;
}

interface IWithProps {
  commonBalanceEuro: string
}

type TProps = IStateProps & IDispatchProps & IWithProps;

type TCommonBalanceProps = {
  commonBalanceEuro: string
}

const CommonBalance: React.FunctionComponent<TCommonBalanceProps> = ({ commonBalanceEuro }) =>
  <div>
    <div className={styles.commonBalanceTitle}>Wallet balance</div>
    €<Money
    className={styles.commonBalance}
    currencySymbol={ECurrencySymbol.NONE}
    inputFormat={ENumberInputFormat.ULPS}
    outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
    value={commonBalanceEuro}
    valueType={ECurrency.EUR}
  />
  </div>

const BankAccount = ({ verifyBankAccount, bankAccount }) => (
  <Container className={styles.linkedBankAccountWrapper} columnSpan={EColumnSpan.ONE_COL}>
    <div className={styles.asideTitle}>
      <FormattedMessage id="wallet.linked-bank-account-title" />
    </div>
    {/*fixme disable if user is not verified*/}
    <ButtonInline
      className={styles.linkButtonInline}
      onClick={verifyBankAccount}
      data-test-id="locked-wallet.neur.bank-account.link-account"
      disabled={false}
    >
      <FormattedMessage id="shared-component.wallet-verified-bank-account.link-account" />
    </ButtonInline>
    <div className={styles.linkedBankAccount}>
      <img className={styles.bankIcon} src={bankIcon} alt="" />
      <div>
        <p className={cn(styles.bankNumber, "m-0")} data-test-id="wallet.bank-account.details">
          <BankNumber last4={bankAccount.details.bankAccountNumberLast4} bank={bankAccount.details.bankName} />
        </p>
      </div>
    </div>
  </Container>
)

const NoBankAccount = ({ verifyBankAccount }) => (
  <Container className={styles.noLinkedBankAccountWrapper} columnSpan={EColumnSpan.ONE_COL}>

    <div className={styles.asideTitle}>
      <FormattedMessage id="wallet.linked-bank-account-title" />
    </div>
    <div className={styles.noLinkedBankAccount}>
      <FormattedHTMLMessage tagName="span" id="wallet.no-linked-bank-account" values={{ href: "" }} />
      <Button
        onClick={verifyBankAccount}
        size={EButtonSize.SMALL}
        layout={EButtonLayout.SECONDARY}
        className={styles.linkButton}
      >
        <TokenIcon srcSet={{ "1x": tokenIcon }} alt="" className={styles.linkButtonIcon} />
        <FormattedMessage id="wallet.link-bank-account" />
      </Button>
    </div>
  </Container>
)

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
    actions: walletData.walletActions.map((walletAction,i) =>
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

const walletNames = {
  "eth":`${selectUnits(ECurrency.ETH)}`,
  "neur":`${selectUnits(ECurrency.EUR)}`,
  "icbm_eth":`Icbm ${selectUnits(ECurrency.ETH)}`,
  "icbm_neur":`Icbm ${selectUnits(ECurrency.EUR)}`,
  "locked_icbm_eth":`Icbm ${selectUnits(ECurrency.ETH)}`,
  "locked_icbm_neur":`Icbm ${selectUnits(ECurrency.EUR)}`,
}

const currencySymbols = {
  "eth":tokenIcon,
  "neur":tokenIcon,
  "icbm_eth":tokenIcon,
  "icbm_neur":tokenIcon,
  "locked_icbm_eth":tokenIcon,
  "locked_icbm_neur":tokenIcon,
}

const walletActions = (dispatch)=> ({
  "eth":[
    {dispatchAction:() =>dispatch(actions.txTransactions.startWithdrawEth()), condition:(data)=>hasBalance(data.balance), text: <FormattedMessage id="shared-component.account-balance.send" />},
    {dispatchAction:() => dispatch(actions.depositEthModal.showDepositEthModal()), condition:true, text: <FormattedMessage id="shared-component.account-balance.receive" />}
    ],
  "neur":[
    {dispatchAction:() =>dispatch(actions.txTransactions.startWithdrawNEuro()), condition:(data)=>hasBalance(data.balance), text: <FormattedMessage id="components.wallet.start.neur-wallet.redeem" />},
    {dispatchAction:() => dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.PURCHASE)), condition:true, text: <FormattedMessage id="components.wallet.start.neur-wallet.purchase" />}
    ],
  "icbm_eth":[],
  "icbm_neur":[],
  "locked_icbm_eth":[{dispatchAction:() =>dispatch(actions.txTransactions.startUpgrade(ETokenType.ETHER)), condition:true, text: <FormattedMessage id="wallet.enable-icbm"/>}],
  "locked_icbm_neur":[{dispatchAction:() =>dispatch(actions.txTransactions.startUpgrade(ETokenType.EURO)), condition:true, text: <FormattedMessage id="wallet.enable-icbm"/>}],
})


export const WalletComponent: React.FunctionComponent<TProps> = ({
  userAddress,
  verifyBankAccount,
  commonBalanceEuro,
  bankAccount,

  walletActions,
  walletData
}) => {

  const wallets = walletData.map(wallet => {
    return {
      logo:currencySymbols[wallet.name],
      currencyName: walletNames[wallet.name],
      amount: wallet.amount,
      euroEquivalentAmount: wallet.euroEquivalentAmount,
      walletActions: walletActions[wallet.name]
    }
  })
    .map(walletData =>
      SingleWallet(walletData)
    )


  return (
  <>
    <Container columnSpan={EColumnSpan.TWO_COL} type={EContainerType.INHERIT_GRID}>
      <Container columnSpan={EColumnSpan.TWO_COL}>
        <DashboardTitle titleText={<FormattedMessage id="wallet.title" />} />
      </Container>

      <Container columnSpan={EColumnSpan.TWO_COL}>
        <CommonBalance commonBalanceEuro={commonBalanceEuro} />
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
            data={wallets}
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
)};

export const Wallet = compose<React.FunctionComponent>(
  onEnterAction({
    actionCreator: dispatch => {
      dispatch(actions.wallet.loadWalletData());
      dispatch(actions.kyc.loadBankAccountDetails());
    },
  }),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      userAddress: selectEthereumAddress(state),
      // Wallet Related State
      isLoading: selectIsLoading(state),
      error: selectWalletError(state),
      individualAddress: selectIndividualAddress(state),
      bankAccount: selectBankAccount(state),
      ethWalletData: {
        amount: selectLiquidEtherBalance(state),
        euroEquivalentAmount: selectLiquidEtherBalanceEuroAmount(state),
      },
      neuroWalletData: {
        amount: selectLiquidEuroTokenBalance(state),
        euroEquivalentAmount: selectLiquidEuroTokenBalance(state),
        neurStatus: selectNEURStatus(state),
      },
      icbmEthWalletData: {
        amount: selectLockedEtherBalance(state),
        euroEquivalentAmount: selectLockedEtherBalanceEuroAmount(state),
      },
      icbmNeuroWalletData: {
        amount: selectLockedEuroTokenBalance(state),
        euroEquivalentAmount: selectLockedEuroTokenBalance(state),
      },
      lockedIcbmEthWalletData: {
        amount: selectICBMLockedEtherBalance(state),
        euroEquivalentAmount: selectICBMLockedEtherBalanceEuroAmount(state),
        isEtherUpgradeTargetSet: selectIsEtherUpgradeTargetSet(state),
      },
      lockedIcbmNeuroWalletData: {
        amount: selectICBMLockedEuroTokenBalance(state),
        euroEquivalentAmount: selectICBMLockedEuroTokenBalance(state),
        isEuroUpgradeTargetSet: selectIsEuroUpgradeTargetSet(state),
      },
    }),
    dispatchToProps: dispatch => ({
      walletActions: walletActions(dispatch),
      verifyBankAccount: () =>
        dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.VERIFY)),
    }),
  }),
  withContainer(WalletContainer),
  branch<IStateProps>(props => props.isLoading, renderComponent(LoadingIndicatorContainer)),
  withProps<IWithProps, IStateProps>(({
    ethWalletData,
    neuroWalletData,
    icbmEthWalletData,
    icbmNeuroWalletData,
    lockedIcbmEthWalletData,
    lockedIcbmNeuroWalletData
  }) => ({
    commonBalanceEuro: addBigNumbers([
      ethWalletData.euroEquivalentAmount,
      neuroWalletData.euroEquivalentAmount,
      icbmEthWalletData.euroEquivalentAmount,
      icbmEthWalletData.euroEquivalentAmount,
      lockedIcbmEthWalletData.euroEquivalentAmount,
      lockedIcbmNeuroWalletData.euroEquivalentAmount,
    ]),

    walletData: [
      {
        name: "eth",
        hasFunds: compareBigNumbers(ethWalletData.amount, "0") > 0,
        amount:ethWalletData.amount,
        euroEquivalentAmount:ethWalletData.euroEquivalentAmount
      },
      {
        name: "neur",
        hasFunds:compareBigNumbers(neuroWalletData.amount, "0") > 0,
        amount:neuroWalletData.amount,
        euroEquivalentAmount:neuroWalletData.euroEquivalentAmount
      },
      {
        name: "icbm_eth",
        hasFunds:compareBigNumbers(icbmEthWalletData.amount, "0") > 0,
        amount:icbmEthWalletData.amount,
        euroEquivalentAmount:icbmEthWalletData.euroEquivalentAmount
      },
      {
        name: "icbm_neur",
        hasFunds:compareBigNumbers(icbmNeuroWalletData.amount, "0") > 0,
        amount:icbmNeuroWalletData.amount,
        euroEquivalentAmount:icbmNeuroWalletData.euroEquivalentAmount
      },
      {
        name: "locked_icbm_eth",
        hasFunds:compareBigNumbers(lockedIcbmEthWalletData.amount, "0") > 0,
        amount:lockedIcbmEthWalletData.amount,
        euroEquivalentAmount:lockedIcbmEthWalletData.euroEquivalentAmount
      },
      {
        name: "locked_icbm_neur",
        hasFunds:compareBigNumbers(lockedIcbmNeuroWalletData.amount, "0") > 0,
        amount:lockedIcbmNeuroWalletData.amount,
        euroEquivalentAmount:lockedIcbmNeuroWalletData.euroEquivalentAmount
      }
    ]
      .filter((data) => data.hasFunds)
  }))
)(WalletComponent);
