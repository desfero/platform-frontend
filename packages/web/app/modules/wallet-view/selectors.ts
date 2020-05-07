import { TAppGlobalState } from "../../store";

export const selectWalletViewData = (state: TAppGlobalState) =>
  state.walletView.wallets
