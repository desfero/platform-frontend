import { ENEURWalletStatus, walletApi } from "@neufund/shared-modules";
import * as React from "react";
import { branch, renderComponent } from "recompose";
import { compose } from "redux";

import { actions } from "../../../../modules/actions";
import { EBankTransferType } from "../../../../modules/bank-transfer-flow/reducer";
import { selectIndividualAddress } from "../../../../modules/kyc/selectors";
import { ETokenType } from "../../../../modules/tx/types";
import { selectNEURStatus } from "../../../../modules/wallet/selectors";
import { selectEthereumAddress } from "../../../../modules/web3/selectors";
import { appConnect } from "../../../../store";
import { onEnterAction } from "../../../../utils/react-connected-components/OnEnterAction";
import { Container, EColumnSpan } from "../../../layouts/Container";
import { LoadingIndicatorContainer } from "../../../shared/loading-indicator";
import { TransactionsHistory } from "../../transactions-history/TransactionsHistory";
import { IcbmWallet, IIcbmWalletValues } from "../../wallet-balance/IcbmWallet";
import { LockedWallet } from "../../wallet-balance/LockedWallet";
import { UnlockedETHWallet } from "../../wallet-balance/UnlockedETHWallet";
import { UnlockedNEURWallet } from "../../wallet-balance/UnlockedNEURWallet";
import { IWalletValues } from "../../wallet-balance/WalletBalance";

interface IStateProps {
  error?: string;
  liquidWalletData: IWalletValues;
  lockedWalletData: IWalletValues & { hasFunds: boolean };
  icbmWalletData: IIcbmWalletValues;
  userAddress: string;
  isLoading: boolean;
  neurStatus: ENEURWalletStatus;
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

type TProps = IStateProps & IDispatchProps;

export const WalletStartComponent: React.FunctionComponent<TProps> = ({
  depositEthUnlockedWallet,
  icbmWalletData,
  neurStatus,
  liquidWalletData,
  lockedWalletData,
  purchaseNEur,
  redeemNEur,
  upgradeWalletEtherToken,
  upgradeWalletEuroToken,
  userAddress,
  verifyBankAccount,
  withdrawEthUnlockedWallet,
  individualAddress,
}) => (
  <>
    <UnlockedETHWallet
      ethAmount={liquidWalletData.ethAmount}
      ethEuroAmount={liquidWalletData.ethEuroAmount}
      totalEuroAmount={liquidWalletData.totalEuroAmount}
      depositEth={depositEthUnlockedWallet}
      withdrawEth={withdrawEthUnlockedWallet}
      address={userAddress}
      columnSpan={EColumnSpan.ONE_AND_HALF_COL}
    />

    <UnlockedNEURWallet
      neuroAmount={liquidWalletData.neuroAmount}
      neuroEuroAmount={liquidWalletData.neuroEuroAmount}
      onPurchase={purchaseNEur}
      onRedeem={redeemNEur}
      onVerify={verifyBankAccount}
      neurStatus={neurStatus}
      individualAddress={individualAddress}
      columnSpan={EColumnSpan.ONE_AND_HALF_COL}
    />

    {lockedWalletData.hasFunds && <LockedWallet className="h-100" data={lockedWalletData} />}

    {icbmWalletData.hasFunds && (
      <IcbmWallet
        className="h-100"
        onUpgradeEuroClick={upgradeWalletEuroToken}
        onUpgradeEtherClick={upgradeWalletEtherToken}
        data={icbmWalletData}
      />
    )}

    {process.env.NF_TRANSACTIONS_HISTORY_VISIBLE === "1" && (
      <Container columnSpan={EColumnSpan.THREE_COL}>
        <TransactionsHistory />
      </Container>
    )}
  </>
);

export const WalletStart = compose<React.FunctionComponent>(
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
      isLoading: walletApi.selectors.selectIsLoading(state),
      error: walletApi.selectors.selectWalletError(state),
      neurStatus: selectNEURStatus(state),
      individualAddress: selectIndividualAddress(state),
      liquidWalletData: {
        ethAmount: walletApi.selectors.selectLiquidEtherBalance(state),
        ethEuroAmount: walletApi.selectors.selectLiquidEtherBalanceEuroAmount(state),
        neuroAmount: walletApi.selectors.selectLiquidEuroTokenBalance(state),
        neuroEuroAmount: walletApi.selectors.selectLiquidEuroTokenBalance(state),
        totalEuroAmount: walletApi.selectors.selectLiquidEuroTotalAmount(state),
      },
      lockedWalletData: {
        hasFunds: walletApi.selectors.selectLockedWalletHasFunds(state),
        ethAmount: walletApi.selectors.selectLockedEtherBalance(state),
        ethEuroAmount: walletApi.selectors.selectLockedEtherBalanceEuroAmount(state),
        neuroAmount: walletApi.selectors.selectLockedEuroTokenBalance(state),
        neuroEuroAmount: walletApi.selectors.selectLockedEuroTokenBalance(state),
        totalEuroAmount: walletApi.selectors.selectLockedEuroTotalAmount(state),
      },
      icbmWalletData: {
        hasFunds: walletApi.selectors.selectICBMLockedWalletHasFunds(state),
        ethAmount: walletApi.selectors.selectICBMLockedEtherBalance(state),
        ethEuroAmount: walletApi.selectors.selectICBMLockedEtherBalanceEuroAmount(state),
        neuroAmount: walletApi.selectors.selectICBMLockedEuroTokenBalance(state),
        neuroEuroAmount: walletApi.selectors.selectICBMLockedEuroTokenBalance(state),
        totalEuroAmount: walletApi.selectors.selectICBMLockedEuroTotalAmount(state),
        isEtherUpgradeTargetSet: walletApi.selectors.selectIsEtherUpgradeTargetSet(state),
        isEuroUpgradeTargetSet: walletApi.selectors.selectIsEuroUpgradeTargetSet(state),
      },
    }),
    dispatchToProps: dispatch => ({
      depositEthUnlockedWallet: () => dispatch(actions.depositEthModal.showDepositEthModal()),
      withdrawEthUnlockedWallet: () => dispatch(actions.txTransactions.startWithdrawEth()),
      upgradeWalletEuroToken: () => dispatch(actions.txTransactions.startUpgrade(ETokenType.EURO)),
      upgradeWalletEtherToken: () =>
        dispatch(actions.txTransactions.startUpgrade(ETokenType.ETHER)),
      purchaseNEur: () =>
        dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.PURCHASE)),
      verifyBankAccount: () =>
        dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.VERIFY)),
      redeemNEur: () => dispatch(actions.txTransactions.startWithdrawNEuro()),
    }),
  }),
  branch<IStateProps>(props => props.isLoading, renderComponent(LoadingIndicatorContainer)),
)(WalletStartComponent);
