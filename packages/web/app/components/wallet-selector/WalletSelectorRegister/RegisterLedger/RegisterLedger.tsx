import { withContainer } from "@neufund/shared-utils";
import { branch, compose, renderComponent, withProps } from "recompose";

import { actions } from "../../../../modules/actions";
import { selectWalletSelectorData } from "../../../../modules/wallet-selector/selectors";
import {
  ECommonWalletRegistrationFlowState,
  ELedgerRegistrationFlowState,
  TBrowserWalletRegisterData,
  TLedgerRegisterData,
  TWalletRegisterData,
} from "../../../../modules/wallet-selector/types";
import { appConnect } from "../../../../store";
import { EContentWidth } from "../../../layouts/Content";
import { TContentExternalProps, TransitionalLayout } from "../../../layouts/Layout";
import { LoadingIndicator } from "../../../shared/loading-indicator/LoadingIndicator";
import { shouldNeverHappen } from "../../../shared/NeverComponent";
import { DefaultLedgerError } from "../../shared/ledger-wallet/DefaultLedgerError/DefaultLedgerError";
import {
  LedgerOnboardingContainer,
  TLedgerContainerBaseProps,
} from "../../shared/ledger-wallet/LedgerOnboardingContainer";
import { WalletLedgerChooser } from "../../shared/ledger-wallet/WalletLedgerChooser/WalletLedgerChooser";
import { WalletLedgerNotSupported } from "../../shared/ledger-wallet/WalletLedgerNotSupported/WalletLedgerNotSupported";
import { WalletLoading } from "../../shared/WalletLoading";
import { BrowserWalletAskForEmailAndTos } from "../RegisterBrowserWallet/RegisterBrowserWalletForm";

export const RegisterLedger = compose<TWalletRegisterData, {}>(
  appConnect<TWalletRegisterData>({
    stateToProps: state => ({
      ...selectWalletSelectorData(state),
    }),
    dispatchToProps: dispatch => ({
      submitForm: (email: string) =>
        dispatch(actions.walletSelector.genericWalletRegisterFormData(email, true)),
      closeAccountChooser: () => {
        dispatch(actions.walletSelector.ledgerCloseAccountChooser());
      },
      tryToEstablishConnectionWithLedger: () => dispatch(actions.walletSelector.ledgerReconnect()),
    }),
  }),
  branch<TLedgerRegisterData>(
    ({ uiState }) => uiState === ELedgerRegistrationFlowState.LEDGER_ACCOUNT_CHOOSER,
    renderComponent(WalletLedgerChooser),
  ),
  branch<TLedgerRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_LOADING,
    renderComponent(LoadingIndicator),
  ),
  withContainer(
    withProps<TContentExternalProps, {}>({ width: EContentWidth.SMALL })(TransitionalLayout),
  ),
  withContainer(
    withProps<TLedgerContainerBaseProps, { showWalletSelector: boolean | undefined }>(
      ({ showWalletSelector }) => ({
        showWalletSelector,
        isLogin: false,
      }),
    )(LedgerOnboardingContainer),
  ),
  branch<TWalletRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.NOT_STARTED,
    renderComponent(LoadingIndicator),
  ),
  branch<TLedgerRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
    renderComponent(LoadingIndicator),
  ),
  branch<TLedgerRegisterData>(
    ({ uiState }) => uiState === ELedgerRegistrationFlowState.LEDGER_NOT_SUPPORTED,
    renderComponent(WalletLedgerNotSupported),
  ),
  branch<TLedgerRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_FORM,
    renderComponent(BrowserWalletAskForEmailAndTos),
  ),
  branch<TLedgerRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_VERIFYING_EMAIL,
    renderComponent(WalletLoading),
  ),
  branch<TBrowserWalletRegisterData>(
    ({ uiState }) =>
      uiState === ECommonWalletRegistrationFlowState.REGISTRATION_EMAIL_VERIFICATION_ERROR,
    renderComponent(BrowserWalletAskForEmailAndTos),
  ),
  branch<TLedgerRegisterData>(
    ({ uiState }) => uiState === ELedgerRegistrationFlowState.LEDGER_INIT,
    renderComponent(WalletLoading),
  ),
  branch<TLedgerRegisterData>(
    ({ uiState }) => uiState === ELedgerRegistrationFlowState.LEDGER_INIT_ERROR,
    renderComponent(DefaultLedgerError),
  ),
)(shouldNeverHappen("RegisterLedger reached default branch"));
