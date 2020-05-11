import { withContainer } from "@neufund/shared-utils";
import { branch, compose, renderComponent, withProps } from "recompose";

import { actions } from "../../../../modules/actions";
import { ELogoutReason } from "../../../../modules/auth/types";
import {
  selectLedgerErrorMessage,
  selectWalletSelectorData,
} from "../../../../modules/wallet-selector/selectors";
import {
  ECommonWalletRegistrationFlowState,
  ELedgerRegistrationFlowState,
  TLedgerRegisterData,
  TWalletRegisterData,
} from "../../../../modules/wallet-selector/types";
import { appConnect } from "../../../../store";
import { onEnterAction } from "../../../../utils/react-connected-components/OnEnterAction";
import { EContentWidth } from "../../../layouts/Content";
import { TransitionalLayout, TTransitionalLayoutProps } from "../../../layouts/Layout";
import { LoadingIndicator } from "../../../shared/loading-indicator/LoadingIndicator";
import { LedgerErrorMessage } from "../../../translatedMessages/messages";
import { TMessage } from "../../../translatedMessages/utils";
import { DefaultLedgerError } from "../../shared/ledger-wallet/DefaultLedgerError/DefaultLedgerError";
import { LedgerFirmwareNotSupported } from "../../shared/ledger-wallet/LedgerFirmwareNotSupported/LedgerFirmwareNotSupported";
import { LedgerOnboardingContainer } from "../../shared/ledger-wallet/LedgerOnboardingContainer";
import { WalletLedgerChooser } from "../../shared/ledger-wallet/WalletLedgerChooser/WalletLedgerChooser";
import { WalletLedgerNotSupported } from "../../shared/ledger-wallet/WalletLedgerNotSupported/WalletLedgerNotSupported";

type IWalletLedgerStateProps = TWalletRegisterData & {
  error: TMessage | undefined;
};

interface IDispatchProps {
  tryToEstablishConnectionWithLedger: () => void;
}

export const LoginWalletLedger = compose<{}, {}>(
  appConnect<IWalletLedgerStateProps, IDispatchProps>({
    stateToProps: state => ({
      error: selectLedgerErrorMessage(state),
      ...selectWalletSelectorData(state),
    }),
    dispatchToProps: dispatch => ({
      tryToEstablishConnectionWithLedger: () => dispatch(actions.walletSelector.ledgerReconnect()),
    }),
  }),
  onEnterAction({
    actionCreator: dispatch => {
      dispatch(actions.walletSelector.loginWithLedger());
    },
  }),
  branch<IWalletLedgerStateProps>(
    ({ uiState }) => uiState === ELedgerRegistrationFlowState.LEDGER_ACCOUNT_CHOOSER,
    renderComponent(WalletLedgerChooser),
  ),
  branch<IWalletLedgerStateProps>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_LOADING,
    renderComponent(LoadingIndicator),
  ),
  withContainer(
    withProps<TTransitionalLayoutProps, { location: { state: { logoutReason: ELogoutReason } } }>(
      ({ location }) => ({
        width: EContentWidth.SMALL,
        isLoginRoute: true,
        showLogoutReason: !!(
          location.state && location.state.logoutReason === ELogoutReason.SESSION_TIMEOUT
        ),
      }),
    )(TransitionalLayout),
  ),
  withContainer(
    withProps<
      { showWalletSelector: boolean | undefined; isLogin: boolean | null | undefined },
      { showWalletSelector: boolean | undefined }
    >(({ showWalletSelector }) => ({
      isLogin: true,
      showWalletSelector,
    }))(LedgerOnboardingContainer),
  ),
  branch<IWalletLedgerStateProps>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.NOT_STARTED,
    renderComponent(LoadingIndicator),
  ),
  branch<TLedgerRegisterData>(
    ({ uiState }) => uiState === ELedgerRegistrationFlowState.LEDGER_NOT_SUPPORTED,
    renderComponent(WalletLedgerNotSupported),
  ),
  branch<IWalletLedgerStateProps>(
    ({ error }) => !!error && error.messageType === LedgerErrorMessage.NOT_SUPPORTED,
    renderComponent(LedgerFirmwareNotSupported),
  ),
  branch<TLedgerRegisterData>(
    ({ uiState }) => uiState === ELedgerRegistrationFlowState.LEDGER_INIT_ERROR,
    renderComponent(DefaultLedgerError),
  ),
  branch<IWalletLedgerStateProps>(
    ({ uiState }) => uiState === ELedgerRegistrationFlowState.LEDGER_INIT,
    renderComponent(LoadingIndicator),
  ),
  branch<IWalletLedgerStateProps>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
    renderComponent(LoadingIndicator),
  ),
)(() => null);
