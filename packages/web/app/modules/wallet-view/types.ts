import { EProcessState } from "../../utils/enums/processStates";
import {  EthereumAddressWithChecksum } from "@neufund/shared-utils";
import { TBankAccount } from "../kyc/types";
import { TTranslatedString } from "@neufund/design-system";

export enum EBalanceType {
  ETH = "WALLET_TYPE_ETH",
  NEUR = "WALLET_TYPE_NEUR",
  ICBM_ETH = "WALLET_TYPE_ICBM_ETH",
  ICBM_NEUR = "WALLET_TYPE_ICBM_NEUR",
  LOCKED_ICBM_ETH = "WALLET_TYPE_LOCKED_ICBM_ETH",
  LOCKED_ICBM_NEUR = "WALLET_TYPE_LOCKED_ICBM_NEUR",
}

export type TBalanceData = {
  name: EBalanceType
  amount: string
  euroEquivalentAmount:string
}

export type TWalletViewReadyState = {
  balanceData: TBalanceData[],
  walletBalanceEuro: string
  userAddress: EthereumAddressWithChecksum,
  bankAccount: TBankAccount | undefined
}

export type TWalletViewState = ({
  processState: EProcessState.SUCCESS,
} & TWalletViewReadyState)
  | ({
  processState: EProcessState.ERROR | EProcessState.NOT_STARTED | EProcessState.IN_PROGRESS,
} & {})

export type TBalance = {
  logo: string,
  balanceName: string,
  amount: string,
  euroEquivalentAmount: string,
  walletActions: TBalanceAction[]
}

export type TBalanceAction = { dispatchAction: (x: unknown)=>void, disableIf: (w: TBalance) => boolean, text: TTranslatedString }

export type TBalanceActions = { [key in EBalanceType]: TBalanceAction[] }
