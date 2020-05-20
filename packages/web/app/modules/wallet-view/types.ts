import { TTranslatedString } from "@neufund/design-system";
import { ECurrency, EthereumAddressWithChecksum } from "@neufund/shared-utils";

import { EProcessState } from "../../utils/enums/processStates";
import { TBankAccount } from "../kyc/types";

export type TBasicBalanceData = {
  name: EBalanceType;
  hasFunds: boolean;
  amount: string;
  euroEquivalentAmount: string;
};

export enum EBalanceType {
  ETH = "balanceTypeEth",
  NEUR = "balanceTypeNeur",
  RESTRICTED_NEUR = "balanceTypeRestrictedNeur",
  ICBM_ETH = "balanceTypeIcbmEth",
  ICBM_NEUR = "balanceTypeIcbmNeur",
  LOCKED_ICBM_ETH = "balanceTypeLockedIcbmEth",
  LOCKED_ICBM_NEUR = "balanceTypeLockedIcbmNeur",
}

export enum EBalanceActionLevel {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

export type TBalanceData = {
  name: EBalanceType;
  amount: string;
  euroEquivalentAmount: string;
};

export type TWalletViewReadyState = {
  balanceData: TBalanceData[];
  totalBalanceEuro: string;
  userAddress: EthereumAddressWithChecksum;
  bankAccount: TBankAccount | undefined;
  userIsFullyVerified: boolean;
};

export type TWalletViewState =
  | ({
      processState: EProcessState.SUCCESS;
    } & TWalletViewReadyState)
  | ({
      processState: EProcessState.ERROR | EProcessState.NOT_STARTED | EProcessState.IN_PROGRESS;
    } & {});

export type TBalance = {
  logo: React.ComponentType;
  balanceName: string;
  balanceAdditionalInfo: TTranslatedString | undefined;
  amount: string;
  currency: ECurrency;
  euroEquivalentAmount: string;
  walletActions: TBalanceAction[];
  dataTestId?: string;
};

export type TBalanceAction = {
  dispatchAction: (x: unknown) => void;
  disableIf: (w: TBalance) => boolean;
  text: TTranslatedString;
  level: EBalanceActionLevel;
  dataTestId?: string;
};

export type TBalanceActions = { [key in EBalanceType]: TBalanceAction[] };
