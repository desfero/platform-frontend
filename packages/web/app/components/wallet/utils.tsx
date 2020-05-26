import {
  EthIcon,
  EthIconWithLock,
  NeuroIcon,
  NeuroIconWithLock,
  TTranslatedString,
} from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { actions } from "../../modules/actions";
import { EBankTransferType } from "../../modules/bank-transfer-flow/reducer";
import { hasBalance } from "../../modules/investment-flow/utils";
import { ETokenType } from "../../modules/tx/types";
import {
  EBalanceActionLevel,
  EBalanceViewType,
  TBalanceActions,
  TBalanceData,
} from "../../modules/wallet-view/types";
import { ECurrency } from "../shared/formatters/utils";

export const createBalanceUiData = (balance: TBalanceData, balanceActions: TBalanceActions) => ({
  logo: balanceSymbols[balance.name],
  balanceName: balanceNames[balance.name],
  balanceAdditionalInfo: balanceAdditionalInfo[balance.name],
  amount: balance.amount,
  currency: balanceCurrencies[balance.name],
  euroEquivalentAmount: balance.euroEquivalentAmount,
  walletActions: balanceActions[balance.name],
  dataTestId: balanceDataTestIds[balance.name],
});

export const balanceCurrencies: { [key in EBalanceViewType]: ECurrency } = {
  [EBalanceViewType.ETH]: ECurrency.ETH,
  [EBalanceViewType.NEUR]: ECurrency.EUR,
  [EBalanceViewType.RESTRICTED_NEUR]: ECurrency.EUR,
  [EBalanceViewType.ICBM_ETH]: ECurrency.ETH,
  [EBalanceViewType.ICBM_NEUR]: ECurrency.EUR,
  [EBalanceViewType.LOCKED_ICBM_ETH]: ECurrency.ETH,
  [EBalanceViewType.LOCKED_ICBM_NEUR]: ECurrency.EUR,
};

export const balanceNames: { [key in EBalanceViewType]: string } = {
  [EBalanceViewType.ETH]: `Ether`,
  [EBalanceViewType.NEUR]: `nEUR`,
  [EBalanceViewType.RESTRICTED_NEUR]: `nEUR`,
  [EBalanceViewType.ICBM_ETH]: `Icbm Ether`,
  [EBalanceViewType.ICBM_NEUR]: `Icbm nEUR`,
  [EBalanceViewType.LOCKED_ICBM_ETH]: `Icbm Ether`,
  [EBalanceViewType.LOCKED_ICBM_NEUR]: `Icbm nEUR`,
};

export const balanceAdditionalInfo: { [key in EBalanceViewType]: TTranslatedString | undefined } = {
  [EBalanceViewType.ETH]: undefined,
  [EBalanceViewType.NEUR]: undefined,
  [EBalanceViewType.RESTRICTED_NEUR]: <FormattedMessage id="wallet.neuro-balance-restricted.tooltip" />,
  [EBalanceViewType.ICBM_ETH]: <FormattedMessage id="wallet.icbm-balance-unlocked.tooltip" />,
  [EBalanceViewType.ICBM_NEUR]: <FormattedMessage id="wallet.icbm-balance-unlocked.tooltip" />,
  [EBalanceViewType.LOCKED_ICBM_ETH]: <FormattedMessage id="wallet.icbm-balance-locked.tooltip" />,
  [EBalanceViewType.LOCKED_ICBM_NEUR]: <FormattedMessage id="wallet.icbm-balance-locked.tooltip" />,
};

export const balanceSymbols: { [key in EBalanceViewType]: React.ComponentType } = {
  [EBalanceViewType.ETH]: EthIcon,
  [EBalanceViewType.NEUR]: NeuroIcon,
  [EBalanceViewType.RESTRICTED_NEUR]: NeuroIconWithLock,
  [EBalanceViewType.ICBM_ETH]: EthIconWithLock,
  [EBalanceViewType.ICBM_NEUR]: NeuroIconWithLock,
  [EBalanceViewType.LOCKED_ICBM_ETH]: EthIconWithLock,
  [EBalanceViewType.LOCKED_ICBM_NEUR]: NeuroIconWithLock,
};

export const balanceDataTestIds: { [key in EBalanceViewType]: string | undefined } = {
  [EBalanceViewType.ETH]: "wallet-balance.eth.balance-value",
  [EBalanceViewType.NEUR]: "wallet-balance.neur.balance-value",
  [EBalanceViewType.RESTRICTED_NEUR]: "wallet-balance.restricted-neur.balance-value",
  [EBalanceViewType.ICBM_ETH]: "icbm-wallet.eth.balance-value",
  [EBalanceViewType.ICBM_NEUR]: "icbm-wallet.neur.balance-value",
  [EBalanceViewType.LOCKED_ICBM_ETH]: "locked-icbm-wallet.eth.balance-value",
  [EBalanceViewType.LOCKED_ICBM_NEUR]: "locked-icbm-wallet.neur.balance-value",
};

export const createBalanceActions = (dispatch: Function): TBalanceActions => ({
  [EBalanceViewType.ETH]: [
    {
      dispatchAction: () => dispatch(actions.txTransactions.startWithdrawEth()),
      disableIf: data => !hasBalance(data.amount),
      text: <FormattedMessage id="shared-component.account-balance.send" />,
      level: EBalanceActionLevel.PRIMARY,
      dataTestId: "wallet.eth.withdraw.button",
    },
    {
      dispatchAction: () => dispatch(actions.depositEthModal.showDepositEthModal()),
      disableIf: () => false,
      text: <FormattedMessage id="shared-component.account-balance.receive" />,
      level: EBalanceActionLevel.PRIMARY,
      dataTestId: "wallet-balance.eth.transfer-button",
    },
  ],
  [EBalanceViewType.NEUR]: [
    {
      dispatchAction: () => dispatch(actions.txTransactions.startWithdrawNEuro()),
      disableIf: data => !hasBalance(data.amount),
      text: <FormattedMessage id="components.wallet.start.neur-wallet.redeem" />,
      level: EBalanceActionLevel.PRIMARY,
      dataTestId: "wallet-balance.neur.redeem-button",
    },
    {
      dispatchAction: () =>
        dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.PURCHASE)),
      disableIf: () => false,
      text: <FormattedMessage id="components.wallet.start.neur-wallet.purchase" />,
      level: EBalanceActionLevel.PRIMARY,
      dataTestId: "wallet-balance.neur.purchase-button",
    },
  ],
  [EBalanceViewType.RESTRICTED_NEUR]: [
    {
      dispatchAction: () => dispatch(actions.txTransactions.startWithdrawNEuro()),
      disableIf: () => true,
      text: <FormattedMessage id="components.wallet.start.neur-wallet.redeem" />,
      level: EBalanceActionLevel.PRIMARY,
      dataTestId: "wallet-balance.neur.redeem-button",
    },
    {
      dispatchAction: () =>
        dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.PURCHASE)),
      disableIf: () => true,
      text: <FormattedMessage id="components.wallet.start.neur-wallet.purchase" />,
      level: EBalanceActionLevel.PRIMARY,
      dataTestId: "wallet-balance.neur.purchase-button",
    },
  ],
  [EBalanceViewType.ICBM_ETH]: [],
  [EBalanceViewType.ICBM_NEUR]: [],
  [EBalanceViewType.LOCKED_ICBM_ETH]: [
    {
      dispatchAction: () => dispatch(actions.txTransactions.startUpgrade(ETokenType.ETHER)),
      disableIf: () => false,
      text: <FormattedMessage id="wallet.enable-icbm" />,
      level: EBalanceActionLevel.SECONDARY,
      dataTestId: "wallet.icbm-eth.upgrade-button",
    },
  ],
  [EBalanceViewType.LOCKED_ICBM_NEUR]: [
    {
      dispatchAction: () => dispatch(actions.txTransactions.startUpgrade(ETokenType.EURO)),
      disableIf: () => false,
      text: <FormattedMessage id="wallet.enable-icbm" />,
      level: EBalanceActionLevel.SECONDARY,
      dataTestId: "wallet.icbm-euro.upgrade-button",
    },
  ],
});
