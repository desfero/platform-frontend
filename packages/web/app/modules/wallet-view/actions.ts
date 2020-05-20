import { createActionFactory } from "@neufund/shared-utils";

import { TWalletViewState } from "./types";

export const walletViewActions = {
  loadWalletView: createActionFactory("LOAD_WALLET_VIEW"),
  walletViewSetError: createActionFactory("WALLET_VIEW_SET_ERROR"),
  walletViewSetData: createActionFactory("WALLET_VIEW_SET_DATA", (data: TWalletViewState) => data),
};
