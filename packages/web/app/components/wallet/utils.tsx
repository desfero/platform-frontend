import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { EBalanceType, TBalanceActions } from "../../modules/wallet-view/types";
import { selectUnits } from "@neufund/shared-utils";
import { ECurrency } from "../shared/formatters/utils";
import { actions } from "../../modules/actions";
import { hasBalance } from "../../modules/investment-flow/utils";
import { EBankTransferType } from "../../modules/bank-transfer-flow/reducer";
import { ETokenType } from "../../modules/tx/types";

import tokenIcon from "../../assets/img/eth_icon.svg";

export const balanceNames: { [key in EBalanceType]: string } = {
  [EBalanceType.ETH]: `${selectUnits(ECurrency.ETH)}`,
  [EBalanceType.NEUR]: `${selectUnits(ECurrency.EUR)}`,
  [EBalanceType.ICBM_ETH]: `Icbm ${selectUnits(ECurrency.ETH)}`,
  [EBalanceType.ICBM_NEUR]: `Icbm ${selectUnits(ECurrency.EUR)}`,
  [EBalanceType.LOCKED_ICBM_ETH]: `Icbm ${selectUnits(ECurrency.ETH)}`,
  [EBalanceType.LOCKED_ICBM_NEUR]: `Icbm ${selectUnits(ECurrency.EUR)}`,
}

export const balanceSymbols: { [key in EBalanceType]: string } = {
  [EBalanceType.ETH]: tokenIcon,
  [EBalanceType.NEUR]: tokenIcon,
  [EBalanceType.ICBM_ETH]: tokenIcon,
  [EBalanceType.ICBM_NEUR]: tokenIcon,
  [EBalanceType.LOCKED_ICBM_ETH]: tokenIcon,
  [EBalanceType.LOCKED_ICBM_NEUR]: tokenIcon,
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
