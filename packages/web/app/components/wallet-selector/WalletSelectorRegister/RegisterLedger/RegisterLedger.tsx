import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, nest, renderComponent, withProps } from "recompose";

import { withContainer } from "../../../../../../shared/dist/utils/withContainer.unsafe";
import { actions } from "../../../../modules/actions";
import { selectWalletSelectorData } from "../../../../modules/wallet-selector/selectors";
import {
  ECommonWalletRegistrationFlowState,
  ELedgerRegistrationFlowState,
  TBrowserWalletRegisterData,
  TCommonWalletRegisterData,
  TLedgerRegisterData,
  TWalletRegisterData,
} from "../../../../modules/wallet-selector/types";
import { appConnect } from "../../../../store";
import { EContentWidth } from "../../../layouts/Content";
import { FullscreenProgressLayout } from "../../../layouts/FullscreenProgressLayout";
import { TContentExternalProps, TransitionalLayout } from "../../../layouts/Layout";
import { LoadingIndicator } from "../../../shared/loading-indicator/LoadingIndicator";
import { shouldNeverHappen } from "../../../shared/NeverComponent";
import { LedgerErrorMessage } from "../../../translatedMessages/messages";
import { WalletLoading } from "../../shared/WalletLoading";
import { WalletLedgerChooser } from "../../WalletSelectorLogin/WalletLedger/WalletLedgerChooser/WalletLedgerChooser";
import { WalletLedgerInitError } from "../../WalletSelectorLogin/WalletLedger/WalletLedgerInit/WalletLedgerInit";
import { WalletLedgerNotSupported } from "../../WalletSelectorLogin/WalletLedger/WalletLedgerNotSupported/WalletLedgerNotSupported";
import { TWalletBrowserBaseProps } from "../RegisterBrowserWallet/RegisterBrowserWalletContainer";
import { BrowserWalletAskForEmailAndTos } from "../RegisterBrowserWallet/RegisterBrowserWalletForm";
import { RegisterLedgerBase } from "./RegisterLedgerBase";

export const RegisterLedger = compose<TWalletRegisterData, {}>(
  appConnect<TWalletRegisterData>({
    stateToProps: state => ({
      ...selectWalletSelectorData(state),
    }),
    dispatchToProps: dispatch => ({
      submitForm: (email: string) =>
        // TODO: CHANGE THIS
        dispatch(actions.walletSelector.browserWalletRegisterFormData(email, true)),
      closeAccountChooser: () => {
        dispatch(actions.walletSelector.ledgerCloseAccountChooser());
        dispatch(
          actions.walletSelector.ledgerConnectionEstablishedError({
            messageType: LedgerErrorMessage.USER_CANCELLED,
          }),
        );
      },
    }),
  }),
  branch<TLedgerRegisterData>(
    ({ uiState }) => uiState === ELedgerRegistrationFlowState.LEDGER_ACCOUNT_CHOOSER,
    renderComponent(
      nest(
        withProps<TContentExternalProps, { closeAccountChooser: () => void }>(
          ({ closeAccountChooser }) => ({
            width: EContentWidth.FULL,
            buttonProps: {
              buttonText: <FormattedMessage id="account-recovery.step.cancel" />,
              buttonAction: closeAccountChooser,
            },
          }),
        )(FullscreenProgressLayout),
        WalletLedgerChooser,
      ),
    ),
  ),
  withContainer(
    withProps<TContentExternalProps, {}>({ width: EContentWidth.SMALL })(TransitionalLayout),
  ),
  branch<TWalletRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.NOT_STARTED,
    renderComponent(LoadingIndicator),
  ),
  withContainer(
    withProps<TWalletBrowserBaseProps, TCommonWalletRegisterData>(
      ({ rootPath, showWalletSelector }) => ({
        rootPath,
        showWalletSelector,
        isLoginRoute: false,
      }),
    )(RegisterLedgerBase),
  ),
  // TODO fixme rename to browser not supported and add ledger version not supported
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
    renderComponent(WalletLedgerInitError),
  ),
)(shouldNeverHappen("RegisterLedger reached default branch"));