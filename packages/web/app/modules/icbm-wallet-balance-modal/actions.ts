import { ILockedWallet } from "@neufund/shared-modules";
import { createActionFactory } from "@neufund/shared-utils";

import { ETokenType } from "../tx/types";
import { IWalletMigrationData } from "./reducer";

export const icbmWalletBalanceModalActions = {
  // UX
  showIcbmWalletBalanceModal: createActionFactory("ICBM_WALLET_BALANCE_MODAL_SHOW"),
  hideIcbmWalletBalanceModal: createActionFactory("ICBM_WALLET_BALANCE_MODAL_HIDE"),
  // Getters
  getWalletData: createActionFactory(
    "ICBM_WALLET_BALANCE_MODAL_GET_WALLET_DATA",
    (icbmWalletEthAddress: string) => ({ icbmWalletEthAddress }),
  ),
  //Setters
  loadIcbmWalletData: createActionFactory(
    "ICBM_WALLET_BALANCE_MODAL_LOAD_WALLET_DATA",
    (data: ILockedWallet) => ({ data }),
  ),
  loadIcbmMigrationData: createActionFactory(
    "ICBM_WALLET_BALANCE_MODAL_LOAD_MIGRATION_DATA",
    (walletMigrationData: IWalletMigrationData[]) => ({
      walletMigrationData,
    }),
  ),
  setFirstTxDone: createActionFactory("ICBM_WALLET_BALANCE_MODAL_FIRST_TRANSACTION_DONE"),
  setSecondTxDone: createActionFactory("ICBM_WALLET_BALANCE_MODAL_SECOND_TRANSACTION_DONE"),
  setMigrationStepToNextStep: createActionFactory(
    "ICBM_WALLET_BALANCE_MODAL_SET_MIGRATION_STEP_TO_NEXT",
  ),
  // Flow
  startMigrationFlow: createActionFactory("ICBM_WALLET_BALANCE_MODAL_START_MIGRATION"),
  downloadICBMWalletAgreement: createActionFactory(
    "ICBM_WALLET_BALANCE_MODAL_DOWNLOAD_AGREEMENT",
    (tokenType: ETokenType) => ({ tokenType }),
  ),
};
