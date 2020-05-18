import { EWalletType } from "@neufund/shared-modules";
import { branch, compose, renderComponent } from "recompose";

import { selectRegisterWalletType } from "../../../modules/wallet-selector/selectors";
import { appConnect } from "../../../store";
import { createErrorBoundary } from "../../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryLayout } from "../../shared/errorBoundary/ErrorBoundaryLayout";
import { shouldNeverHappen } from "../../shared/NeverComponent";
import { RegisterBrowserWallet } from "./RegisterBrowserWallet/RegisterBrowserWallet";
import { RegisterLedger } from "./RegisterLedger/RegisterLedger";
import { RegisterLightWallet } from "./RegisterLightWallet/RegisterLightWallet";

type TStateProps = { walletType: EWalletType };

export const WalletSelectorRegister = compose<TStateProps, {}>(
  createErrorBoundary(ErrorBoundaryLayout),
  appConnect<TStateProps>({
    stateToProps: s => ({
      walletType: selectRegisterWalletType(s),
    }),
  }),

  branch<TStateProps>(
    ({ walletType }) => walletType === EWalletType.LIGHT,
    renderComponent(RegisterLightWallet),
  ),
  branch<TStateProps>(
    ({ walletType }) => walletType === EWalletType.BROWSER,
    renderComponent(RegisterBrowserWallet),
  ),
  branch<TStateProps>(
    ({ walletType }) => walletType === EWalletType.LEDGER,
    renderComponent(RegisterLedger),
  ),
)(shouldNeverHappen("WalletSelectorRegister reached default branch"));
