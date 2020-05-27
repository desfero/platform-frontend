import { createActionFactory } from "@neufund/shared-utils";

import { IWalletStateData } from "./types";

export const walletActions = {
  loadWalletData: createActionFactory("WALLET_LOAD_WALLET_DATA"),
  saveWalletData: createActionFactory("WALLET_SAVE_WALLET_DATA", (data: IWalletStateData) => ({
    data,
  })),
  loadWalletDataError: createActionFactory("WALLET_LOAD_WALLET_DATA_ERROR", (errorMsg: string) => ({
    errorMsg,
  })),
  stopWalletBalanceWatcher: createActionFactory("STOP_WALLET_BALANCE_WATCHER"),
};
