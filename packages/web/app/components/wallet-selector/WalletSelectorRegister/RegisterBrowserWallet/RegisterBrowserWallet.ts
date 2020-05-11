import { withContainer } from "@neufund/shared-utils";
import { Location } from "history";
import { branch, compose, renderComponent, withProps } from "recompose";

import { EUserType } from "../../../../lib/api/users/interfaces";
import { actions } from "../../../../modules/actions";
import { selectWalletSelectorData } from "../../../../modules/wallet-selector/selectors";
import {
  EBrowserWalletRegistrationFlowState,
  ECommonWalletRegistrationFlowState,
  TBrowserWalletRegisterData,
  TWalletRegisterData,
} from "../../../../modules/wallet-selector/types";
import { appConnect } from "../../../../store";
import { EContentWidth } from "../../../layouts/Content";
import { TContentExternalProps, TransitionalLayout } from "../../../layouts/Layout";
import { createErrorBoundary } from "../../../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryLayout } from "../../../shared/errorBoundary/ErrorBoundaryLayout";
import { LoadingIndicator } from "../../../shared/loading-indicator/LoadingIndicator";
import { shouldNeverHappen } from "../../../shared/NeverComponent";
import { BrowserWalletError } from "../../shared/browser-wallet/BrowserWalletError";
import { WalletLoading } from "../../shared/WalletLoading";
import {
  RegisterBrowserWalletContainer,
  TWalletBrowserBaseExternalProps,
} from "./RegisterBrowserWalletContainer";
import { BrowserWalletAskForEmailAndTos } from "./RegisterBrowserWalletForm";

interface IStateProps {
  rootPath: string;
  isLoginRoute: boolean;
  userType: EUserType;
}

interface IDispatchProps {
  submitForm: (email: string, tos: boolean) => void;
}

type TAdditionalProps = {
  showWalletSelector: boolean;
  showLogoutReason: boolean;
  redirectLocation: Location;
};

export const RegisterBrowserWallet = compose<IStateProps & IDispatchProps & TAdditionalProps, {}>(
  createErrorBoundary(ErrorBoundaryLayout),
  appConnect<TWalletRegisterData, IDispatchProps>({
    stateToProps: s => ({
      ...selectWalletSelectorData(s),
    }),
    dispatchToProps: dispatch => ({
      submitForm: (email: string, tos: boolean) =>
        dispatch(actions.walletSelector.genericWalletRegisterFormData(email, tos)),
    }),
  }),
  branch<TBrowserWalletRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_LOADING,
    renderComponent(WalletLoading),
  ),
  withContainer(
    withProps<TContentExternalProps, {}>({ width: EContentWidth.SMALL })(TransitionalLayout),
  ),
  branch<TWalletRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.NOT_STARTED,
    renderComponent(LoadingIndicator),
  ),
  withContainer(
    withProps<
      Omit<TWalletBrowserBaseExternalProps, "showWalletSelector">,
      { uiState: ECommonWalletRegistrationFlowState }
    >(({ uiState }) => ({
      isLogin: false,
      uiState,
    }))(RegisterBrowserWalletContainer),
  ),
  branch<TBrowserWalletRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_FORM,
    renderComponent(BrowserWalletAskForEmailAndTos),
  ),
  branch<TBrowserWalletRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_VERIFYING_EMAIL,
    renderComponent(WalletLoading),
  ),
  branch<TBrowserWalletRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
    renderComponent(WalletLoading),
  ),
  branch<TBrowserWalletRegisterData>(
    ({ uiState }) =>
      uiState === ECommonWalletRegistrationFlowState.REGISTRATION_EMAIL_VERIFICATION_ERROR,
    renderComponent(BrowserWalletAskForEmailAndTos),
  ),
  branch<TBrowserWalletRegisterData>(
    ({ uiState }) => uiState === EBrowserWalletRegistrationFlowState.BROWSER_WALLET_ERROR,
    renderComponent(BrowserWalletError),
  ),
)(shouldNeverHappen("RegisterBrowserWallet reached default branch"));
