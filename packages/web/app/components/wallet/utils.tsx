import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { EBalanceType, TBalanceActions } from "../../modules/wallet-view/types";
import { ECurrency } from "../shared/formatters/utils";
import { actions } from "../../modules/actions";
import { hasBalance } from "../../modules/investment-flow/utils";
import { EBankTransferType } from "../../modules/bank-transfer-flow/reducer";
import { ETokenType } from "../../modules/tx/types";

import { EthIcon, NeuroIcon } from "@neufund/design-system";

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

export const balanceSymbols: { [key in EBalanceType]: React.ComponentType } = {
  [EBalanceType.ETH]: EthIcon,
  [EBalanceType.NEUR]: NeuroIcon,
  [EBalanceType.ICBM_ETH]: EthIcon,
  [EBalanceType.ICBM_NEUR]: NeuroIcon,
  [EBalanceType.LOCKED_ICBM_ETH]: EthIcon,
  [EBalanceType.LOCKED_ICBM_NEUR]: NeuroIcon,
}

export const balanceActions = (dispatch:Function):TBalanceActions => ({
  [EBalanceType.ETH]: [
    {
      dispatchAction: () => dispatch(actions.txTransactions.startWithdrawEth()),
      disableIf: (data) => !hasBalance(data.amount),
      text: <FormattedMessage id="shared-component.account-balance.send" />
    },
    {
      dispatchAction: () => dispatch(actions.depositEthModal.showDepositEthModal()),
      disableIf: () => false,
      text: <FormattedMessage id="shared-component.account-balance.receive" />
    }
  ],
  [EBalanceType.NEUR]: [
    {
      dispatchAction: () => dispatch(actions.txTransactions.startWithdrawNEuro()),
      disableIf: (data) => !hasBalance(data.amount),
      text: <FormattedMessage id="components.wallet.start.neur-wallet.redeem" />
    },
    {
      dispatchAction: () => dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.PURCHASE)),
      disableIf: () => false,
      text: <FormattedMessage id="components.wallet.start.neur-wallet.purchase" />
    }
  ],
  [EBalanceType.ICBM_ETH]: [],
  [EBalanceType.ICBM_NEUR]: [],
  [EBalanceType.LOCKED_ICBM_ETH]: [{
    dispatchAction: () => dispatch(actions.txTransactions.startUpgrade(ETokenType.ETHER)),
    disableIf: () => false,
    text: <FormattedMessage id="wallet.enable-icbm" />
  }],
  [EBalanceType.LOCKED_ICBM_NEUR]: [{
    dispatchAction: () => dispatch(actions.txTransactions.startUpgrade(ETokenType.EURO)),
    disableIf: () => false,
    text: <FormattedMessage id="wallet.enable-icbm" />
  }],
})
