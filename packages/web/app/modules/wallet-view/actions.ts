import { createActionFactory } from "@neufund/shared-utils";
import { TWalletViewData } from "./reducer";

export const walletViewActions = {
  loadWalletView: createActionFactory("LOAD_WALLET_VIEW"),
  walletViewSetError: createActionFactory("WALLET_VIEW_SET_ERROR"),
  walletViewSetData: createActionFactory(
    "WALLET_VIEW_SET_DATA",
    (wallets: TWalletViewData[]) => ({wallets})
  ),
}
