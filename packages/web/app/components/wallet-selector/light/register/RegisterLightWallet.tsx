import { withContainer } from "@neufund/shared";
import { branch, compose, renderComponent, withProps } from "recompose";

import { actions } from "../../../../modules/actions";
import { selectWalletSelectorData } from "../../../../modules/wallet-selector/selectors";
import {
  ECommonWalletRegistrationFlowState,
  TCommonWalletRegisterData,
  TLightWalletFormValues,
  TLightWalletRegisterData,
  TWalletRegisterData,
} from "../../../../modules/wallet-selector/types";
import { appConnect } from "../../../../store";
import { EContentWidth } from "../../../layouts/Content";
import { TContentExternalProps, TransitionalLayout } from "../../../layouts/Layout";
import { LoadingIndicator } from "../../../shared/loading-indicator/LoadingIndicator";
import { shouldNeverHappen } from "../../../shared/NeverComponent";
import { TMessage } from "../../../translatedMessages/utils";
import { WalletLoading } from "../../shared/WalletLoading";
import { RegisterLightWalletContainer } from "./RegisterLightWalletContainer";
import { RegisterEnhancedLightWalletForm } from "./RegisterLightWalletForm";

export type TStateProps = {
  errorMessage: TMessage | undefined;
  initialFormValues: TLightWalletFormValues;
} & TCommonWalletRegisterData;

export type TRegisterWalletExternalProps = {
  restore?: boolean;
};

export type TDispatchProps = {
  submitForm: (values: TLightWalletFormValues) => void;
};

export const RegisterLightWallet = compose<
  TStateProps & TDispatchProps,
  TRegisterWalletExternalProps
>(
  appConnect<TWalletRegisterData, TDispatchProps>({
    stateToProps: state => ({
      ...selectWalletSelectorData(state),
    }),
    dispatchToProps: dispatch => ({
      submitForm: (values: TLightWalletFormValues) =>
        dispatch(actions.walletSelector.lightWalletRegisterFormData(values.email, values.password)),
    }),
  }),
  withContainer(
    withProps<TContentExternalProps, {}>({ width: EContentWidth.SMALL })(TransitionalLayout),
  ),
  branch<TWalletRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.NOT_STARTED,
    renderComponent(LoadingIndicator),
  ),
  withContainer(RegisterLightWalletContainer),
  branch<TLightWalletRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_FORM,
    renderComponent(RegisterEnhancedLightWalletForm),
  ),
  branch<TLightWalletRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_VERIFYING_EMAIL,
    renderComponent(WalletLoading),
  ),
  branch<TLightWalletRegisterData>(
    ({ uiState }) =>
      uiState === ECommonWalletRegistrationFlowState.REGISTRATION_EMAIL_VERIFICATION_ERROR,
    renderComponent(RegisterEnhancedLightWalletForm),
  ),
  branch<TLightWalletRegisterData>(
    ({ uiState }) => uiState === ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
    renderComponent(WalletLoading),
  ),
)(shouldNeverHappen("RegisterLightWallet reached default branch"));
