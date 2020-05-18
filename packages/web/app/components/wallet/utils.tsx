import { EthIcon, EthIconWithLock, NeuroIcon, TTranslatedString } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { actions } from "../../modules/actions";
import { EBankTransferType } from "../../modules/bank-transfer-flow/reducer";
import { hasBalance } from "../../modules/investment-flow/utils";
import { ETokenType } from "../../modules/tx/types";
import { EBalanceActionLevel, EBalanceType, TBalanceActions } from "../../modules/wallet-view/types";
import { ECurrency } from "../shared/formatters/utils";


export const balanceCurrencies: { [key in EBalanceType]: ECurrency } = {
  [EBalanceType.ETH]: ECurrency.ETH,
  [EBalanceType.NEUR]: ECurrency.EUR,
  [EBalanceType.ICBM_ETH]: ECurrency.ETH,
  [EBalanceType.ICBM_NEUR]: ECurrency.EUR,
  [EBalanceType.LOCKED_ICBM_ETH]: ECurrency.ETH,
  [EBalanceType.LOCKED_ICBM_NEUR]: ECurrency.EUR,
}

export const balanceNames: { [key in EBalanceType]: string } = {
  [EBalanceType.ETH]: `Ether`,
  [EBalanceType.NEUR]: `nEUR`,
  [EBalanceType.ICBM_ETH]: `Icbm Ether`,
  [EBalanceType.ICBM_NEUR]: `Icbm nEUR`,
  [EBalanceType.LOCKED_ICBM_ETH]: `Icbm Ether`,
  [EBalanceType.LOCKED_ICBM_NEUR]: `Icbm nEUR`,
}

export const balanceAdditionalInfo: { [key in EBalanceType]: TTranslatedString | undefined } = {
  [EBalanceType.ETH]: undefined,
  [EBalanceType.NEUR]: undefined,
  [EBalanceType.ICBM_ETH]: <FormattedMessage id="wallet.icbm-balance-unlocked.tooltip" />,
  [EBalanceType.ICBM_NEUR]: <FormattedMessage id="wallet.icbm-balance-unlocked.tooltip" />,
  [EBalanceType.LOCKED_ICBM_ETH]: <FormattedMessage id="wallet.icbm-balance-locked.tooltip" />,
  [EBalanceType.LOCKED_ICBM_NEUR]: <FormattedMessage id="wallet.icbm-balance-locked.tooltip" />,
}

export const balanceSymbols: { [key in EBalanceType]: React.ComponentType } = {
  [EBalanceType.ETH]: EthIcon,
  [EBalanceType.NEUR]: NeuroIcon,
  [EBalanceType.ICBM_ETH]: EthIconWithLock,
  [EBalanceType.ICBM_NEUR]: EthIconWithLock,
  [EBalanceType.LOCKED_ICBM_ETH]: EthIconWithLock,
  [EBalanceType.LOCKED_ICBM_NEUR]: EthIconWithLock,
}

export const createBalanceActions = (dispatch: Function): TBalanceActions => ({
  [EBalanceType.ETH]: [
    {
      dispatchAction: () => dispatch(actions.txTransactions.startWithdrawEth()),
      disableIf: (data) => !hasBalance(data.amount),
      text: <FormattedMessage id="shared-component.account-balance.send" />,
      level: EBalanceActionLevel.PRIMARY
    },
    {
      dispatchAction: () => dispatch(actions.depositEthModal.showDepositEthModal()),
      disableIf: () => false,
      text: <FormattedMessage id="shared-component.account-balance.receive" />,
      level: EBalanceActionLevel.PRIMARY
    }
  ],
  [EBalanceType.NEUR]: [
    {
      dispatchAction: () => dispatch(actions.txTransactions.startWithdrawNEuro()),
      disableIf: (data) => !hasBalance(data.amount),
      text: <FormattedMessage id="components.wallet.start.neur-wallet.redeem" />,
      level: EBalanceActionLevel.PRIMARY
    },
    {
      dispatchAction: () => dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.PURCHASE)),
      disableIf: () => false,
      text: <FormattedMessage id="components.wallet.start.neur-wallet.purchase" />,
      level: EBalanceActionLevel.PRIMARY
    }
  ],
  [EBalanceType.ICBM_ETH]: [],
  [EBalanceType.ICBM_NEUR]: [],
  [EBalanceType.LOCKED_ICBM_ETH]: [{
    dispatchAction: () => dispatch(actions.txTransactions.startUpgrade(ETokenType.ETHER)),
    disableIf: () => false,
    text: <FormattedMessage id="wallet.enable-icbm" />,
    level: EBalanceActionLevel.SECONDARY
  }],
  [EBalanceType.LOCKED_ICBM_NEUR]: [{
    dispatchAction: () => dispatch(actions.txTransactions.startUpgrade(ETokenType.EURO)),
    disableIf: () => false,
    text: <FormattedMessage id="wallet.enable-icbm" />,
    level: EBalanceActionLevel.SECONDARY
  }],
})
