import { withContainer } from "@neufund/shared-utils";
import { branch, compose, renderComponent, withProps } from "recompose";

import { actions } from "../../../../modules/actions";
import { ELogoutReason } from "../../../../modules/auth/types";
import { selectWalletSelectorData } from "../../../../modules/wallet-selector/selectors";
import {
  EBrowserWalletRegistrationFlowState,
  ECommonWalletRegistrationFlowState,
  TBrowserWalletRegisterData,
} from "../../../../modules/wallet-selector/types";
import { appConnect } from "../../../../store";
import { onEnterAction } from "../../../../utils/react-connected-components/OnEnterAction";
import { EContentWidth } from "../../../layouts/Content";
import { TransitionalLayout, TTransitionalLayoutProps } from "../../../layouts/Layout";
import { LoadingIndicator } from "../../../shared/loading-indicator";
import { BrowserWalletError } from "../../shared/browser-wallet/BrowserWalletError";
import {
  RegisterBrowserWalletContainer,
  TWalletBrowserBaseExternalProps,
} from "../../WalletSelectorRegister/RegisterBrowserWallet/RegisterBrowserWalletContainer";

export type TWalletBrowserProps = {};

export type TWalletBrowserDispatchProps = {
  tryConnectingWithBrowserWallet: () => void;
};

export const LoginBrowserWallet = compose(
  appConnect<TWalletBrowserProps, TWalletBrowserDispatchProps>({
    stateToProps: state => ({
      ...selectWalletSelectorData(state),
    }),
    dispatchToProps: dispatch => ({
      tryConnectingWithBrowserWallet: () => {
        dispatch(actions.walletSelector.tryConnectingWithBrowserWallet());
      },
    }),
  }),
  onEnterAction({
    actionCreator: dispatch => {
      dispatch(actions.walletSelector.browserWalletSignMessage());
    },
  }),
  branch<TBrowserWalletRegisterData>(
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
      Omit<TWalletBrowserBaseExternalProps, "showWalletSelector">,
      { uiState: ECommonWalletRegistrationFlowState }
    >(({ uiState }) => ({
      isLogin: true,
      uiState,
    }))(RegisterBrowserWalletContainer),
  ),
  branch<TBrowserWalletRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
    renderComponent(LoadingIndicator),
  ),
  branch<TBrowserWalletRegisterData>(
    ({ uiState }) => uiState === EBrowserWalletRegistrationFlowState.BROWSER_WALLET_ERROR,
    renderComponent(BrowserWalletError),
  ),
)(() => null);
