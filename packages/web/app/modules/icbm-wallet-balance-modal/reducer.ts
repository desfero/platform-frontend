import { ILockedWallet } from "@neufund/shared-modules";
import { DeepReadonly } from "@neufund/shared-utils";

import { AppReducer } from "../../store";
import { actions } from "../actions";

export type TWalletMigrationSteps = 1 | 2;
export interface IWalletMigrationData {
  smartContractAddress: string;
  migrationInputData: string;
  gasLimit: string;
  value: string;
}
export interface IIcbmWalletBalanceModal {
  isOpen: boolean;
  loading: boolean;
  icbmWalletEthAddress?: string;
  icbmLockedEthWallet?: ILockedWallet;
  walletMigrationData?: IWalletMigrationData[];
  currentMigrationStep: TWalletMigrationSteps;
  isMigrating: boolean;
  firstTransactionDone: boolean;
  secondTransactionDone: boolean;
}

const initialState: IIcbmWalletBalanceModal = {
  isOpen: false,
  loading: false,
  isMigrating: false,
  firstTransactionDone: false,
  secondTransactionDone: false,
  currentMigrationStep: 1,
};

export const icbmWalletBalanceModalReducer: AppReducer<IIcbmWalletBalanceModal> = (
  state = initialState,
  action,
): DeepReadonly<IIcbmWalletBalanceModal> => {
  switch (action.type) {
    case actions.icbmWalletBalanceModal.showIcbmWalletBalanceModal.getType():
      return {
        ...state,
        isOpen: true,
      };
    case actions.icbmWalletBalanceModal.hideIcbmWalletBalanceModal.getType():
      return {
        ...initialState,
        isOpen: false,
      };
    case actions.icbmWalletBalanceModal.getWalletData.getType():
      return {
        ...state,
        icbmWalletEthAddress: action.payload.icbmWalletEthAddress,
      };
    case actions.icbmWalletBalanceModal.loadIcbmWalletData.getType():
      return {
        ...state,
        loading: false,
        icbmLockedEthWallet: action.payload.data,
      };
    case actions.icbmWalletBalanceModal.loadIcbmMigrationData.getType():
      return {
        ...state,
        loading: false,
        walletMigrationData: action.payload.walletMigrationData,
      };
    case actions.icbmWalletBalanceModal.startMigrationFlow.getType():
      return {
        ...state,
        isMigrating: true,
      };
    case actions.icbmWalletBalanceModal.setFirstTxDone.getType():
      return {
        ...state,
        firstTransactionDone: true,
      };
    case actions.icbmWalletBalanceModal.setSecondTxDone.getType():
      return {
        ...state,
        secondTransactionDone: true,
      };
    case actions.icbmWalletBalanceModal.setMigrationStepToNextStep.getType():
      return {
        ...state,
        currentMigrationStep: 2,
      };
    default:
      return state;
  }
};
